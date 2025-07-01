
import * as React from 'react';
import AnalyticsClientPage from './analytics-client-page';
import { getDashboardData } from '../actions';

export default async function AnalyticsPage() {
  const dashboardData = await getDashboardData();
  
  // The layout will handle the "not connected" case, so we only need to pass data.
  // The Suspense boundary in the layout will handle the loading state.
  return <AnalyticsClientPage initialAnalytics={dashboardData?.analytics ?? null} />;
}
