import { NextResponse } from 'next/server';
import { getAdminOverviewStats } from '@/lib/admin-stats';

export async function GET(req: Request) {
  try {
    // Optionally, parse date range from query params if needed
    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    let fromDate: Date | undefined = undefined;
    let toDate: Date | undefined = undefined;
    if (from) fromDate = new Date(from);
    if (to) toDate = new Date(to);
    const stats = await getAdminOverviewStats(fromDate, toDate);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
} 