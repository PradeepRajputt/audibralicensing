
import { redirect } from 'next/navigation';

// This page just redirects to the default dashboard view.
export default function DashboardRootPage() {
  redirect('/dashboard/activity');
}
