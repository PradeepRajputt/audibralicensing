
'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, Eye, Video, Link as LinkIcon, LogIn, Youtube } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { getDashboardData } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

type AnalyticsData = Awaited<ReturnType<typeof getDashboardData>>['analytics'];

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      setIsLoading(true);
      getDashboardData().then(dashboardData => {
        setData(dashboardData?.analytics ?? null);
        setIsLoading(false);
      });
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading || status === 'loading') {
    return <AnalyticsSkeleton />;
  }

  if (!session || !data) {
    return <ConnectAccountPrompt />;
  }
  
  const chartConfig = {
    views: { label: 'Views', color: 'hsl(var(--chart-1))' },
    subscribers: { label: "Subscribers", color: "hsl(var(--chart-2))" }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.subscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Real-time channel data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all your videos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Viewed Video</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{data.mostViewedVideo.title}</div>
            <p className="text-xs text-muted-foreground">{typeof data.mostViewedVideo.views === 'number' ? data.mostViewedVideo.views.toLocaleString() : data.mostViewedVideo.views} views</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Views</CardTitle>
            <CardDescription>Total views for the last 6 months (simulated).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={data.monthlyViewsData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="views" fill="var(--color-views)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
            <CardDescription>Subscriber count over the last 6 months (simulated).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart accessibilityLayer data={data.subscriberData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })} tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="var(--color-subscribers)" strokeWidth={2} dot={false} name="subscribers" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-full max-w-sm mt-2" /></CardHeader><CardContent><Skeleton className="h-60 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-full max-w-sm mt-2" /></CardHeader><CardContent><Skeleton className="h-60 w-full" /></CardContent></Card>
            </div>
        </div>
    );
}

function ConnectAccountPrompt() {
    return (
        <Card className="text-center w-full max-w-lg mx-auto">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <LogIn className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="mt-4">Connect Your Account</CardTitle>
                <CardDescription>To view your analytics, please sign in with your Google account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => signIn('google')}>
                    <Youtube className="mr-2 h-5 w-5" />
                    Sign in with Google
                </Button>
            </CardContent>
        </Card>
    );
}
