import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createContentItem, getContentItems } from '@/lib/db';
import { ContentPlacement, ContentStatus, DivisionId } from '@/lib/types';
import { DIVISIONS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrative authentication required.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const division = searchParams.get('division') as DivisionId | undefined;
  const status = searchParams.get('status') as ContentStatus | undefined;
  const placement = searchParams.get('placement') as ContentPlacement | undefined;
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;

  const items = await getContentItems({
    division,
    status,
    placement,
    search,
    category,
    organizationId: session.organizationId,
  });

  return NextResponse.json({ success: true, count: items.length, items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrative authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      slug,
      division,
      category,
      description,
      status = 'draft',
      placements = ['division_gallery'],
      media = [],
      metadata = {},
      sortOrder = 0,
    } = body;

    // Strict Server-Side Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Project title is required.' }, { status: 400 });
    }

    if (!division || !DIVISIONS[division as DivisionId]) {
      return NextResponse.json(
        { error: 'Valid business division is required (cleaning, agriculture, logistics, clothing).' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json({ error: 'Content category is required.' }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json({ error: 'Description is required.' }, { status: 400 });
    }

    // Publishing Validation
    if (status === 'published') {
      if (!Array.isArray(media) || media.length === 0) {
        return NextResponse.json(
          { error: 'Cannot publish without at least one media asset. Please upload an image or save as Draft.' },
          { status: 400 }
        );
      }
      if (!Array.isArray(placements) || placements.length === 0) {
        return NextResponse.json(
          { error: 'Cannot publish without at least one assigned placement slot.' },
          { status: 400 }
        );
      }
    }

    const newItem = await createContentItem({
      organizationId: session.organizationId,
      title: title.trim(),
      slug: slug?.trim() || title.trim(),
      division: division as DivisionId,
      category: category.trim(),
      description: description.trim(),
      status: status as ContentStatus,
      placements: Array.isArray(placements) ? placements : ['division_gallery'],
      media: Array.isArray(media) ? media : [],
      metadata: typeof metadata === 'object' ? metadata : {},
      sortOrder: Number(sortOrder) || 0,
      createdBy: session.email,
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating project:', err);
    return NextResponse.json({ error: err.message || 'Failed to create content item.' }, { status: 500 });
  }
}
