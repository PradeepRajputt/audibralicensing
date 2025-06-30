
'use client';

import * as React from 'react';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Users, Eye, Video } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data generation
const generateMockData = () => {
  const data = [];
  // Generate data for the last 90 days
  for (let i = 89; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      views: Math.floor(Math.random() * 2000) + 1000 + (89 - i) * 50,
      subscribers: Math.floor(Math.random() * 20) + 5 + Math.floor((89 - i)/7),
    });
  }
  return data;
};

const allData = generateMockData();

type ChartType = 'bar' | 'line' | 'area';

export default function AnalyticsPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const [viewsChartType, setViewsChartType] = React.useState<ChartType>('bar');
    const [subscribersChartType, setSubscribersChartType] = React.useState<ChartType>('line');

    const filteredData = React.useMemo(() => {
        if (!date?.from) return [];
        const toDate = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : new Date(date.from.setHours(23, 59, 59, 999));
        
        return allData.filter(d => {
            const dDate = new Date(d.date);
            return dDate >= date.from! && dDate <= toDate;
        })
    }, [date]);
    
    const totalViews = allData.reduce((acc, curr) => acc + curr.views, 0);
    const totalSubscribers = allData.reduce((acc, curr) => acc + curr.subscribers, 0);

    const chartConfig = {
        views: { label: 'Views', color: 'hsl(var(--chart-1))' },
        subscribers: { label: "Subscribers", color: "hsl(var(--chart-2))" },
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Your YouTube Analytics</h1>
                    <p className="text-muted-foreground">
                        An interactive overview of your channel's performance.
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
                    <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total all-time subscribers</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Across all your videos</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Most Viewed Video</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold truncate">My Most Epic Adventure Yet!</div>
                    <p className="text-xs text-muted-foreground">1,203,485 views</p>
                </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>Monthly Views</CardTitle>
                            <CardDescription>Your total views over the selected period.</CardDescription>
                        </div>
                        <Select value={viewsChartType} onValueChange={(value: ChartType) => setViewsChartType(value)}>
                            <SelectTrigger className="w-[120px] flex-shrink-0">
                                <SelectValue placeholder="Chart Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bar">Bar Chart</SelectItem>
                                <SelectItem value="line">Line Chart</SelectItem>
                                <SelectItem value="area">Area Chart</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                           {viewsChartType === 'bar' ? (
                                <BarChart accessibilityLayer data={filteredData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="views" fill="var(--color-views)" radius={4} />
                                </BarChart>
                           ) : viewsChartType === 'line' ? (
                               <LineChart accessibilityLayer data={filteredData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} dot={false} />
                                </LineChart>
                           ) : (
                                <AreaChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
                                    <defs>
                                        <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="views" stroke="var(--color-views)" fill="url(#fillViews)" strokeWidth={2} dot={false} />
                                </AreaChart>
                           )}
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <CardTitle>Subscriber Growth</CardTitle>
                        <Select value={subscribersChartType} onValueChange={(value: ChartType) => setSubscribersChartType(value)}>
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
                            {subscribersChartType === 'line' ? (
                                <LineChart accessibilityLayer data={filteredData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="subscribers" stroke="var(--color-subscribers)" strokeWidth={2} dot={false} />
                                </LineChart>
                            ) : subscribersChartType === 'bar' ? (
                                <BarChart accessibilityLayer data={filteredData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="subscribers" fill="var(--color-subscribers)" radius={4} />
                                </BarChart>
                            ) : (
                                <AreaChart accessibilityLayer data={filteredData}>
                                    <defs>
                                        <linearGradient id="fillSubscribers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-subscribers)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-subscribers)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="subscribers" stroke="var(--color-subscribers)" fill="url(#fillSubscribers)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            )}
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
