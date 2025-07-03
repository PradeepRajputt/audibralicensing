
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScanSearch, ShieldCheck, Youtube } from "lucide-react";
import type { DashboardData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";


export default function DashboardClientPage({ initialData }: { initialData: DashboardData }) {

  const { analytics, activity, user } = initialData || {};
  const creatorName = user?.displayName ?? 'Creator';
  const creatorImage = user?.avatar;
  const isLoading = !initialData;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Youtube className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><ScanSearch className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><ShieldCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-full max-w-md mt-2" /></CardHeader>
          <CardContent><div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{analytics?.views.toLocaleString() || 'N/A'}</div>
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
           {activity && activity.length > 0 ? (
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
