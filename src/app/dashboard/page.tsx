
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanSearch, ShieldCheck, Activity, Youtube } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDashboardData } from './actions';
import type { User } from '@/lib/types';

function NotConnected({ user }: { user?: { name?: string | null; image?: string | null } }) {
    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.image ?? undefined} alt="User Avatar" data-ai-hint="profile picture" />
                        <AvatarFallback>{user?.name?.charAt(0) ?? 'C'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
                        <p className="text-muted-foreground">Please connect your YouTube account to see your dashboard.</p>
                    </div>
                </div>
            </div>
            <Card className="text-center w-full max-w-lg mx-auto mt-8">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        <Youtube className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Connect Your YouTube Channel</CardTitle>
                    <CardDescription>
                   To view your analytics, please connect your YouTube channel in the settings page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/settings">Go to Settings</Link>
                    </Button>
                </CardContent>
            </Card>
        </>
    );
}


// This is now an async Server Component
export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  
  if (!dashboardData) {
      return <p>Could not load dashboard data. Please try refreshing the page.</p>
  }
  
  const { analytics, activity, creatorName, creatorImage } = dashboardData;
  
  if (!analytics) {
      return <NotConnected user={{ name: creatorName, image: creatorImage}} />;
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

