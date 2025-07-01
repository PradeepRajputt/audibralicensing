'use client';

import * as React from 'react';
import AnalyticsClientPage from './analytics-client-page';
import { getDashboardData } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import type { UserAnalytics } from '@/lib/types';

function AnalyticsPageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-[120px]" />
                    <Skeleton className="h-10 w-[300px]" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-20 mt-2" /></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                 <Card><CardHeader className="flex flex-row items-start justify-between gap-4"><Skeleton className="h-10 w-full" /></CardHeader><CardContent><Skeleton className="h-60 w-full" /></CardContent></Card>
                 <Card><CardHeader className="flex flex-row items-start justify-between gap-4"><Skeleton className="h-10 w-full" /></CardHeader><CardContent><Skeleton className="h-60 w-full" /></CardContent></Card>
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = React.useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getDashboardData();
      setAnalyticsData(data?.analytics ?? null);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <AnalyticsPageSkeleton />;
  }

  return <AnalyticsClientPage initialAnalytics={analyticsData} />;
}
