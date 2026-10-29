import { NextRequest, NextResponse } from 'next/server';
import { getContentItems } from '@/lib/db';
import { ContentPlacement, DivisionId } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const division = searchParams.get('division') as DivisionId | undefined;
  const placement = searchParams.get('placement') as ContentPlacement | undefined;
  const category = searchParams.get('category') || undefined;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  // STRICT SECURITY RULE: Public endpoint strictly enforces status = 'published'
  const items = await getContentItems({
    division,
    placement,
    category,
    status: 'published',
    limit,
  });

  // Strip internal administrator metadata before public delivery
  const publicItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    division: item.division,
    category: item.category,
    description: item.description,
    placements: item.placements,
    media: item.media,
    metadata: item.metadata,
    sortOrder: item.sortOrder,
    publishedAt: item.publishedAt || item.createdAt,
  }));

  return NextResponse.json(
    {
      success: true,
      count: publicItems.length,
      items: publicItems,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
