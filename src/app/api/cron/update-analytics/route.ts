
import { NextResponse } from 'next/server';
import { updateAllUserAnalytics } from '@/lib/services/backend-services';

// To trigger this, you would set up a cron job service (e.g., Google Cloud Scheduler)
// to send a GET request to /api/cron/update-analytics on a schedule.
export async function GET() {
  try {
    // In a real app, you might want to secure this endpoint,
    // for example, by checking for a secret header.
    console.log("Cron job started: Updating user analytics.");
    const result = await updateAllUserAnalytics();
    console.log("Cron job finished.", result);

    return NextResponse.json({ success: true, message: 'Analytics update process triggered.', result });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ success: false, message: 'An error occurred during the cron job.' }, { status: 500 });
  }
}
