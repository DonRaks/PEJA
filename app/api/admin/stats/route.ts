import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDashboardStats } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Administrative authentication required.' }, { status: 401 });
  }

  const stats = await getDashboardStats(session.organizationId);
  return NextResponse.json({ success: true, stats });
}
