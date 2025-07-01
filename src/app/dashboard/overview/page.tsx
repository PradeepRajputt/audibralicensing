
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanSearch, ShieldCheck, Activity, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnalogClock } from "@/components/ui/analog-clock";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDashboardData } from '../actions';
import type { UserAnalytics } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'New York (EST)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];


function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-24 w-[280px]" />
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
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


function AnalyticsUnavailable() {
    return (
        <Card className="text-center w-full max-w-lg mx-auto">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <Youtube className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="mt-4">Analytics Unavailable</CardTitle>
                <CardDescription>
                   We couldn't load your YouTube analytics data. Please make sure your channel is correctly connected in the settings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/dashboard/settings">Go to Settings</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function DashboardOverviewPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<{
        analytics: UserAnalytics | null;
        activity: any[];
        creatorName: string | undefined;
        creatorImage: string | undefined;
    } | null>(null);
    const [timeZone, setTimeZone] = useState('UTC');

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const data = await getDashboardData();
            setDashboardData(data);
            setIsLoading(false);
        }
        loadData();
    }, []);

    if (isLoading) {
        return <DashboardSkeleton />;
    }
  
    if (!dashboardData?.analytics) {
        return <AnalyticsUnavailable />;
    }
  
    const { analytics, activity, creatorName, creatorImage } = dashboardData;
  
    return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={creatorImage ?? undefined} alt="User Avatar" data-ai-hint="profile picture" />
            <AvatarFallback>{creatorName?.charAt(0) ?? 'C'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {creatorName}!</h1>
            <p className="text-muted-foreground">What would you like to accomplish today?</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
            <Card className="min-w-[280px] p-6 flex items-center justify-center">
                <AnalogClock timeZone={timeZone} />
            </Card>
            <Select onValueChange={setTimeZone} defaultValue={timeZone}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                    {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Views
            </CardTitle>
            <Youtube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all your videos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Monitors
            </CardTitle>
            <ScanSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              Scanning across 3 platforms
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Strikes
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>A log of recent automated scans and actions for your connected account.</CardDescription>
        </CardHeader>
        <CardContent>
           {activity.length > 0 ? (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {activity.map((activity, index) => (
                    <TableRow key={index}>
                    <TableCell className="font-medium">{activity.type}</TableCell>
                    <TableCell>{activity.details}</TableCell>
                    <TableCell>
                        <Badge variant={activity.variant as any}>{activity.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{activity.date}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
           ) : (
            <div className="text-center py-10 text-muted-foreground">
                <p>No recent activity to display.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
