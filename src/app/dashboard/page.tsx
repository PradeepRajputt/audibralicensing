'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardData } from './actions';
import DashboardClientPage from './dashboard-client-page';
import * as React from 'react';
import type { UserAnalytics } from '@/lib/types';

// This is the loading state for the dashboard
function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full max-w-md mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

type DashboardData = {
  analytics: UserAnalytics | null;
  activity: any[];
  creatorName: string | null | undefined;
  creatorImage: string | null | undefined;
} | null;


export default function DashboardPage() {
    const [dashboardData, setDashboardData] = React.useState<DashboardData>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
          setIsLoading(true);
          const data = await getDashboardData();
          setDashboardData(data);
          setIsLoading(false);
        }
        fetchData();
    }, []);

    if (isLoading) {
        return <DashboardSkeleton />;
    }
  
    return <DashboardClientPage dashboardData={dashboardData} />;
}
