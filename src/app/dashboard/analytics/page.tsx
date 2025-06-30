'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, Eye, Video, Link as LinkIcon, LogIn, Youtube } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { getDashboardData } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AnalyticsData = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>['analytics'];
type ChartType = 'bar' | 'line' | 'area';

// Mock data generation
const generateMockData = () => {
  const data = [];
  for (let i = 89; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      signups: Math.floor(Math.random() * 15) + 5,
      scans: Math.floor(Math.random() * 100) + 50,
    });
  }
  return data;
};

const allData = generateMockData();

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const [userGrowthChartType, setUserGrowthChartType] = React.useState<ChartType>('area');
  const [platformActivityChartType, setPlatformActivityChartType] = React.useState<ChartType>('line');

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

  const filteredData = React.useMemo(() => {
      if (!date?.from) return [];
      const toDate = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : new Date(date.from.setHours(23, 59, 59, 999));
      
      return allData.filter(d => {
          const dDate = new Date(d.date);
          return dDate >= date.from! && dDate <= toDate;
      })
  }, [date]);

  const totalSignups = filteredData.reduce((acc, curr) => acc + curr.signups, 0);
  const totalScans = filteredData.reduce((acc, curr) => acc + curr.scans, 0);

  if (isLoading || status === 'loading') {
    return <AnalyticsSkeleton />;
  }

  if (!session || !data) {
    return <ConnectAccountPrompt />;
  }
  
  const chartConfig = {
    views: { label: 'Views', color: 'hsl(var(--chart-1))' },
    subscribers: { label: "Subscribers", color: "hsl(var(--chart-2))" },
    signups: { label: 'Sign-ups', color: 'hsl(var(--chart-1))' },
    scans: { label: "Scans", color: "hsl(var(--chart-2))" }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
              <h1 className="text-2xl font-bold">Creator Analytics</h1>
              <p className="text-muted-foreground">
                  An overview of your channel's performance.
              </p>
          </div>
          <DateRangePicker date={date} onDateChange={setDate} />
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
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>User Growth</CardTitle>
                            <CardDescription>New creator sign-ups over the selected period.</CardDescription>
                        </div>
                        <Select value={userGrowthChartType} onValueChange={(value: ChartType) => setUserGrowthChartType(value)}>
                            <SelectTrigger className="w-[120px] flex-shrink-0">
                                <SelectValue placeholder="Chart Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="area">Area Chart</SelectItem>
                                <SelectItem value="bar">Bar Chart</SelectItem>
                                <SelectItem value="line">Line Chart</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            {userGrowthChartType === 'bar' ? (
                                <BarChart accessibilityLayer data={filteredData} barCategoryGap="20%">
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
                                </BarChart>
                            ) : userGrowthChartType === 'line' ? (
                                <LineChart accessibilityLayer data={filteredData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="signups" stroke="var(--color-signups)" strokeWidth={2} dot={false} />
                                </LineChart>
                            ) : (
                                <AreaChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
                                    <defs>
                                        <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-signups)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-signups)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="signups" stroke="var(--color-signups)" fill="url(#fillSignups)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            )}
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>Platform Activity</CardTitle>
                            <CardDescription>Automated scans performed per day.</CardDescription>
                        </div>
                        <Select value={platformActivityChartType} onValueChange={(value: ChartType) => setPlatformActivityChartType(value)}>
                            <SelectTrigger className="w-[120px] flex-shrink-0">
                                <SelectValue placeholder="Chart Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="line">Line Chart</SelectItem>
                                <SelectItem value="bar">Bar Chart</SelectItem>
                                <SelectItem value="area">Area Chart</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            {platformActivityChartType === 'line' ? (
                                <LineChart accessibilityLayer data={filteredData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="scans" stroke="var(--color-scans)" strokeWidth={2} dot={false} />
                                </LineChart>
                            ) : platformActivityChartType === 'bar' ? (
                                <BarChart accessibilityLayer data={filteredData} barCategoryGap="20%">
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="scans" fill="var(--color-scans)" radius={4} />
                                </BarChart>
                            ) : (
                                <AreaChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
                                     <defs>
                                        <linearGradient id="fillScans" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-scans)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-scans)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="scans" stroke="var(--color-scans)" fill="url(#fillScans)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            )}
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
            <div className="flex justify-end">
                <Skeleton className="h-10 w-[300px]" />
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
                <Button onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
                    <Youtube className="mr-2 h-5 w-5" />
                    Sign in with Google
                </Button>
            </CardContent>
        </Card>
    );
}
