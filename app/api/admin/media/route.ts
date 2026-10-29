import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveMediaFile } from '@/lib/storage';
import { getContentItems } from '@/lib/db';
import { MediaItem } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrative authentication required.' }, { status: 401 });
  }

  const items = await getContentItems({ organizationId: session.organizationId });
  const mediaMap = new Map<string, MediaItem & { usedInProjects: Array<{ id: string; title: string; division: string }> }>();

  for (const item of items) {
    if (item.media && Array.isArray(item.media)) {
      for (const m of item.media) {
        if (!mediaMap.has(m.url)) {
          mediaMap.set(m.url, {
            ...m,
            usedInProjects: [{ id: item.id, title: item.title, division: item.division }],
          });
        } else {
          mediaMap.get(m.url)!.usedInProjects.push({ id: item.id, title: item.title, division: item.division });
        }
      }
    }
  }

  const allMedia = Array.from(mediaMap.values());
  return NextResponse.json({ success: true, count: allMedia.length, media: allMedia });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrative authentication required.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const altText = (formData.get('alt') as string) || '';

    const uploadQueue: File[] = [];
    if (singleFile) uploadQueue.push(singleFile);
    if (files && files.length > 0) {
      for (const f of files) {
        if (!uploadQueue.includes(f)) uploadQueue.push(f);
      }
    }

    if (uploadQueue.length === 0) {
      return NextResponse.json({ error: 'No files provided in upload payload.' }, { status: 400 });
    }

    const savedItems: MediaItem[] = [];
    const errors: Array<{ filename: string; error: string }> = [];

    for (const file of uploadQueue) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const saved = await saveMediaFile(buffer, file.name, file.type, altText);
        savedItems.push(saved);
      } catch (err: any) {
        console.error(`Failed to process upload for ${file.name}:`, err);
        errors.push({ filename: file.name, error: err.message || 'Processing failed' });
      }
    }

    if (savedItems.length === 0) {
      return NextResponse.json(
        { error: 'All uploads failed validation.', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: savedItems.length,
        items: savedItems,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Media upload handler error:', err);
    return NextResponse.json({ error: err.message || 'Media upload failed.' }, { status: 500 });
  }
}
