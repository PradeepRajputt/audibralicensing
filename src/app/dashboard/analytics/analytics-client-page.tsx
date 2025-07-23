'use client';

import * as React from 'react';
import { format, subDays, startOfWeek, endOfMonth, startOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Users, Eye, Video, Palette, Youtube, LogIn, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from '@/components/ui/skeleton';
import { useYouTube } from '@/context/youtube-context';
import { useDashboardData } from '../dashboard-context';
import { useRouter } from 'next/navigation';

type ChartType = 'area' | 'bar' | 'line';
type AggregationType = 'day' | 'week' | 'month';

const chartColors = [
    { name: 'Chart 1', value: 'hsl(var(--chart-1))', display: 'hsl(var(--chart-1))' },
    { name: 'Chart 2', value: 'hsl(var(--chart-2))', display: 'hsl(var(--chart-2))' },
    { name: 'Chart 3', value: 'hsl(var(--chart-3))', display: 'hsl(var(--chart-3))' },
    { name: 'Chart 4', value: 'hsl(var(--chart-4))', display: 'hsl(var(--chart-4))' },
    { name: 'Chart 5', value: 'hsl(var(--chart-5))', display: 'hsl(var(--chart-5))' },
];

function ColorPicker({ color, setColor }: { color: string, setColor: (color: string) => void }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <Palette className="h-4 w-4" style={{ color }} />
                    <span className="sr-only">Change Color</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1">
                <div className="flex items-center">
                    {chartColors.map((c, i) => (
                        <React.Fragment key={c.name}>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-full flex items-center justify-center border-0 focus:outline-none"
                                onClick={() => setColor(c.value)}
                                aria-label={c.name}
                                style={{ padding: 0, boxShadow: 'none' }}
                            >
                                <span
                                    className="block h-5 w-5 rounded-full"
                                    style={{
                                        background: c.display,
                                        backgroundColor: c.display,
                                        border: color === c.value ? '2px solid #fff' : '1.5px solid #444',
                                        boxSizing: 'border-box',
                                        display: 'block',
                                    }}
                                />
                            </Button>
                            {i < chartColors.length - 1 && (
                                <span className="mx-1 text-lg text-muted-foreground select-none">|</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function AnalyticsLoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-full max-w-md" />
                </div>
                 <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Skeleton className="h-10 w-full sm:w-[120px]" />
                    <Skeleton className="h-10 w-full sm:w-[300px]" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                 <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                 <Card><CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
            </div>
             <div className="grid gap-6 lg:grid-cols-2">
                <Card><CardHeader className="flex flex-row items-start justify-between gap-4"><div><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-full max-w-sm mt-2" /></div><Skeleton className="h-10 w-32" /></CardHeader><CardContent><Skeleton className="h-60 w-full" /></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-start justify-between gap-4"><div><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-full max-w-sm mt-2" /></div><Skeleton className="h-10 w-32" /></CardHeader><CardContent><Skeleton className="h-60 w-full" /></CardContent></Card>
            </div>
        </div>
    )
}

function ConnectYoutubePlaceholder() {
    const router = useRouter();
    return (
       <Card className="text-center w-full max-w-lg mx-auto">
          <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Youtube className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="mt-4">Connect Your YouTube Account</CardTitle>
              <CardDescription>To view your analytics, please connect your YouTube channel in settings.</CardDescription>
          </CardHeader>
          <CardContent>
              <Button onClick={() => router.push('/dashboard/settings')}>
                  <LogIn className="mr-2 h-5 w-5" />
                  Connect YouTube in Settings
              </Button>
          </CardContent>
      </Card>
    )
}

// Add a helper function to format Y-axis numbers with K/M/B
function formatYAxisNumber(num: number): string {
  if (num >= 1_000_000_000) return (Math.floor(num / 100_000_000) / 10) + 'B';
  if (num >= 1_000_000) return (Math.floor(num / 100_000) / 10) + 'M';
  if (num >= 1_000) return (Math.floor(num / 100) / 10) + 'K';
  return num.toString();
}

export default function AnalyticsClientPage() {
    const dashboardData = useDashboardData();
    const { isYouTubeConnected } = useYouTube();

    const analytics = dashboardData?.analytics ?? null;
    const isLoading = !dashboardData && isYouTubeConnected;

    const [date, setDate] = React.useState<DateRange | undefined>({ from: subDays(new Date(), 29), to: new Date() });
    const [viewsChartType, setViewsChartType] = React.useState<ChartType>('area');
    const [subscribersChartType, setSubscribersChartType] = React.useState<ChartType>('line');
    const [aggregation, setAggregation] = React.useState<AggregationType>("day");
    const [viewsColor, setViewsColor] = React.useState('hsl(var(--chart-1))');
    const [subscribersColor, setSubscribersColor] = React.useState('hsl(var(--chart-2))');

    const chartConfig = {
        views: { label: 'Views', color: viewsColor },
        subscribers: { label: "Subscribers", color: subscribersColor },
    };

    const { filteredAndAggregatedData, totalViews, totalSubscribers } = React.useMemo(() => {
        if (!analytics?.dailyData || !date?.from) return { filteredAndAggregatedData: [], totalViews: 0, totalSubscribers: 0 };
        
        const toDate = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : new Date(date.from.setHours(23, 59, 59, 999));
        
        const dataInRange = analytics.dailyData.filter(d => {
            const dDate = new Date(d.date);
            return dDate >= date.from! && dDate <= toDate;
        });

        const currentTotalViews = dataInRange.reduce((acc, curr) => acc + curr.views, 0);
        const currentTotalSubscribers = dataInRange.reduce((acc, curr) => acc + curr.subscribers, 0);

        if (aggregation === 'day') {
            return { filteredAndAggregatedData: dataInRange, totalViews: currentTotalViews, totalSubscribers: currentTotalSubscribers };
        }

        const aggregationMap = new Map<string, { date: string, views: number, subscribers: number }>();
        
        dataInRange.forEach(item => {
            const itemDate = new Date(item.date);
            let key: string;

            if (aggregation === 'week') {
                key = format(startOfWeek(itemDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            } else { // month
                key = format(startOfMonth(itemDate), 'yyyy-MM-dd');
            }

            const existing = aggregationMap.get(key) || { date: key, views: 0, subscribers: 0 };
            existing.views += item.views;
            existing.subscribers += item.subscribers;
            aggregationMap.set(key, existing);
        });

        return { filteredAndAggregatedData: Array.from(aggregationMap.values()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), totalViews: currentTotalViews, totalSubscribers: currentTotalSubscribers };

    }, [date, analytics?.dailyData, aggregation]);
    
    const tickFormatter = React.useCallback((value: string) => {
        const date = new Date(value);
        if (aggregation === 'month') return format(date, 'MMM yyyy');
        if (aggregation === 'week') return format(date, 'MMM d');
        return format(date, 'MMM d');
    }, [aggregation]);

    const renderChart = (type: ChartType, dataKey: 'views' | 'subscribers') => {
        const colorVar = `var(--color-${dataKey})`;
        const fillId = `fill${dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}`;

        switch (type) {
            case 'bar':
                return <BarChart accessibilityLayer data={filteredAndAggregatedData} margin={{ left: 20, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickFormatter={tickFormatter} tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickMargin={20} width={40} tickFormatter={formatYAxisNumber} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey={dataKey} fill={colorVar} radius={4} />
                </BarChart>;
            case 'line':
                return <LineChart accessibilityLayer data={filteredAndAggregatedData} margin={{ left: 20, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickFormatter={tickFormatter} tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickMargin={20} width={40} tickFormatter={formatYAxisNumber} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey={dataKey} stroke={colorVar} strokeWidth={2} dot={false} />
                </LineChart>;
            case 'area':
            default:
                return <AreaChart accessibilityLayer data={filteredAndAggregatedData} margin={{ left: 20, right: 12 }}>
                    <defs><linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colorVar} stopOpacity={0.8} /><stop offset="95%" stopColor={colorVar} stopOpacity={0.1} /></linearGradient></defs>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickFormatter={tickFormatter} tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickMargin={20} width={40} tickFormatter={formatYAxisNumber} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey={dataKey} stroke={colorVar} fill={`url(#${fillId})`} strokeWidth={2} dot={false} />
                </AreaChart>;
        }
    }

    if (isLoading) {
        return <AnalyticsLoadingSkeleton />;
    }
    
    if (!isYouTubeConnected) {
        return <ConnectYoutubePlaceholder />;
    }

     if (!analytics) {
        return (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Analytics Data Unavailable</CardTitle>
                    <CardDescription>We couldn't fetch your YouTube analytics. Please check your connection or try again later.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Your YouTube Analytics</h1>
                    <p className="text-muted-foreground">
                        An interactive overview of your channel's performance.
                    </p>
                </div>
                 <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Select value={aggregation} onValueChange={(value: AggregationType) => setAggregation(value)}>
                        <SelectTrigger className="w-full sm:w-[140px] px-4 py-2 min-w-[120px]">
                            <SelectValue placeholder="Group by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Weekly</SelectItem>
                            <SelectItem value="month">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                    <DateRangePicker date={date} onDateChange={setDate} />
                </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.subscribers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total all-time subscribers</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.views.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Across all your videos</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Most Viewed Video</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold truncate">{analytics.mostViewedVideo.title}</div>
                    <p className="text-xs text-muted-foreground">{'number' === typeof analytics.mostViewedVideo.views ? analytics.mostViewedVideo.views.toLocaleString() : 'N/A'} views</p>
                </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>Views</CardTitle>
                            <CardDescription>Total views in the selected period: {totalViews.toLocaleString()}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <ColorPicker color={viewsColor} setColor={setViewsColor} />
                            <Select value={viewsChartType} onValueChange={(value: ChartType) => setViewsChartType(value)}>
                                <SelectTrigger className="w-[160px] flex-shrink-0 px-4 py-2 min-w-[140px]">
                                    <SelectValue placeholder="Chart Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="area">Area Chart</SelectItem>
                                    <SelectItem value="bar">Bar Chart</SelectItem>
                                    <SelectItem value="line">Line Chart</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                           {renderChart(viewsChartType, 'views')}
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                         <div>
                            <CardTitle>Subscriber Growth</CardTitle>
                            <CardDescription>New subscribers in the selected period: +{totalSubscribers.toLocaleString()}</CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                            <ColorPicker color={subscribersColor} setColor={setSubscribersColor} />
                            <Select value={subscribersChartType} onValueChange={(value: ChartType) => setSubscribersChartType(value)}>
                                <SelectTrigger className="w-[160px] flex-shrink-0 px-4 py-2 min-w-[140px]">
                                    <SelectValue placeholder="Chart Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="line">Line Chart</SelectItem>
                                    <SelectItem value="bar">Bar Chart</SelectItem>
                                    <SelectItem value="area">Area Chart</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            {renderChart(subscribersChartType, 'subscribers')}
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
