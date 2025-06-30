'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, Eye, Video, Youtube } from 'lucide-react';
import { getDashboardData } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

type AnalyticsData = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>['analytics'];

function ConfigurationErrorPrompt() {
    return (
        <Card className="text-center w-full max-w-lg mx-auto">
            <CardHeader>
                <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
                    <Youtube className="w-12 h-12 text-destructive" />
                </div>
                <CardTitle className="mt-4">Configuration Error</CardTitle>
                <CardDescription>
                   Could not fetch analytics data from YouTube. Please ensure your `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` are set correctly in the `.env` file and that the YouTube Data API is enabled for your key.
                </CardDescription>
            </CardHeader>
        </Card>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="space-y-1">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
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


export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then(dashboardData => {
        setData(dashboardData?.analytics ?? null);
        setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!data) {
    return <ConfigurationErrorPrompt />;
  }
  
  const chartConfig = {
    views: { label: 'Views', color: 'hsl(var(--chart-1))' },
    subscribers: { label: "Subscribers", color: "hsl(var(--chart-2))" },
  };

  return (
    <div className="space-y-6">
       <div className="space-y-1">
          <h1 className="text-2xl font-bold">Your YouTube Analytics</h1>
          <p className="text-muted-foreground">
              A real-time overview of your channel's performance.
          </p>
      </div>
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
                <CardDescription>Your total views over the past 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart accessibilityLayer data={data.monthlyViewsData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="views" fill="var(--color-views)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>Your subscriber count over the past 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart accessibilityLayer data={data.subscriberData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })} tickLine={false} axisLine={false} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="count" stroke="var(--color-subscribers)" strokeWidth={2} dot={false} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
