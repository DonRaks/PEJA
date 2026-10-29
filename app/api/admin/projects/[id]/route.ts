import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getContentItemById, updateContentItem, deleteContentItem } from '@/lib/db';
import { DIVISIONS } from '@/lib/constants';
import { DivisionId } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrative authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  const item = await getContentItemById(id);

  if (!item) {
    return NextResponse.json({ error: 'Content item not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, item });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrative authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getContentItemById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Content item not found.' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { title, slug, division, category, description, status, placements, media, metadata, sortOrder } = body;

    // Validation
    if (title !== undefined && (!title || typeof title !== 'string' || title.trim().length === 0)) {
      return NextResponse.json({ error: 'Project title cannot be empty.' }, { status: 400 });
    }

    if (division !== undefined && (!division || !DIVISIONS[division as DivisionId])) {
      return NextResponse.json({ error: 'Invalid business division.' }, { status: 400 });
    }

    if (description !== undefined && (!description || typeof description !== 'string' || description.trim().length === 0)) {
      return NextResponse.json({ error: 'Description cannot be empty.' }, { status: 400 });
    }

    // Publishing validation
    const targetStatus = status || existing.status;
    const targetMedia = media !== undefined ? media : existing.media;
    const targetPlacements = placements !== undefined ? placements : existing.placements;

    if (targetStatus === 'published') {
      if (!Array.isArray(targetMedia) || targetMedia.length === 0) {
        return NextResponse.json(
          { error: 'Cannot publish without at least one media asset. Add an image or keep status as Draft.' },
          { status: 400 }
        );
      }
      if (!Array.isArray(targetPlacements) || targetPlacements.length === 0) {
        return NextResponse.json(
          { error: 'Cannot publish without at least one assigned placement slot.' },
          { status: 400 }
        );
      }
    }

    const updated = await updateContentItem(id, {
      ...(title !== undefined && { title: title.trim() }),
      ...(slug !== undefined && { slug: slug.trim() }),
      ...(division !== undefined && { division }),
      ...(category !== undefined && { category: category.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(status !== undefined && { status }),
      ...(placements !== undefined && { placements }),
      ...(media !== undefined && { media }),
      ...(metadata !== undefined && { metadata }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) || 0 }),
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    console.error('Error updating project:', err);
    return NextResponse.json({ error: err.message || 'Failed to update project.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrative authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  const success = await deleteContentItem(id);

  if (!success) {
    return NextResponse.json({ error: 'Content item not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Content item deleted successfully.' });
}
