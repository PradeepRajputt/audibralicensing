
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScanSearch, ShieldCheck, Activity, Youtube } from "lucide-react";
import type { UserAnalytics } from '@/lib/types';


type DashboardData = {
  analytics: UserAnalytics | null;
  activity: any[];
  creatorName: string | null | undefined;
  creatorImage: string | null | undefined;
} | null;

export default function DashboardClientPage({ dashboardData }: { dashboardData: DashboardData }) {

  // This case is handled by the parent layout and page now, but as a fallback:
  if (!dashboardData || !dashboardData.analytics) {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-muted-foreground">Could not load dashboard data. Please connect your channel in settings to see analytics.</p>
        </div>
    )
  }

  const { analytics, activity, creatorName, creatorImage } = dashboardData;
  
  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={creatorImage ?? undefined} alt="User Avatar" data-ai-hint="profile picture" />
            <AvatarFallback>{creatorName?.charAt(0) ?? 'C'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {creatorName}!</h1>
            <p className="text-muted-foreground">Here&#39;s a snapshot of your content&#39;s performance.</p>
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
