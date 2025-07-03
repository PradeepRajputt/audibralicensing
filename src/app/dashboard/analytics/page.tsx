
import AnalyticsClientPage from './analytics-client-page';

export default function AnalyticsPage() {
  // This page is fully client-side and fetches its own data via a Server Action
  // that already sanitizes the user object. No need to pass initialData.
  return <AnalyticsClientPage />;
}
