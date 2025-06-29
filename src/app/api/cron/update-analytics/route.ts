
import { NextResponse } from 'next/server';
import { updateAllUserAnalytics } from '@/lib/services/backend-services';

/**
 * This API route is designed to be called by a scheduled cron job.
 * It triggers a function to update YouTube analytics for all relevant users.
 * To secure this endpoint, it checks for a secret 'Authorization' header.
 *
 * Example usage with curl:
 * curl -X POST "http://localhost:9002/api/cron/update-analytics" -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await updateAllUserAnalytics();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in cron job for updating analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
