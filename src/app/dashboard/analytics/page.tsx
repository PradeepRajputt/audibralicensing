
import * as React from 'react';
import AnalyticsClientPage from './analytics-client-page';

// This is now a simple wrapper. All data fetching is in the layout.
export default async function AnalyticsPage() {
  return <AnalyticsClientPage />;
}
