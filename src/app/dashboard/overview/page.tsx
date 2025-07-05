
import { redirect } from 'next/navigation';

export default function OverviewPage() {
    // This page is deprecated and now redirects to the activity feed
    redirect('/dashboard/activity');
}
