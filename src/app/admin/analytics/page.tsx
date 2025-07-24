
'use client';

import * as React from 'react';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Bar, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Users, ScanSearch, UserPlus } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

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

type ChartType = 'bar' | 'line' | 'area';

export default function AdminAnalyticsPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });
    const [userGrowthChartType, setUserGrowthChartType] = React.useState<ChartType>('area');
    const [platformActivityChartType, setPlatformActivityChartType] = React.useState<ChartType>('line');
    const [userGrowthColor, setUserGrowthColor] = React.useState('hsl(var(--chart-1))');
    const [platformActivityColor, setPlatformActivityColor] = React.useState('hsl(var(--chart-2))');
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        // Build query params for date range
        const params = new URLSearchParams();
        if (date?.from) params.append('from', date.from.toISOString());
        if (date?.to) params.append('to', date.to.toISOString());
        fetch(`/api/admin/analytics?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [date]);

    if (loading || !stats) {
        return <div className="p-8 text-center text-lg">Loading analytics...</div>;
    }

    // Calculate new signups in last 24 hours
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newSignups = stats.chartData
        ? stats.chartData.reduce((acc: number, d: any) => {
            const dDate = new Date(d.date);
            if (dDate >= last24h && dDate <= now) {
                return acc + (d.signups || 0);
            }
            return acc;
        }, 0)
        : 0;

    const totalCreators = stats.totalCreators;
    const totalScans = stats.totalScans;
    const filteredData = stats.chartData;

    const chartConfig = {
        signups: { label: 'Sign-ups', color: userGrowthColor },
        scans: { label: 'Scans', color: platformActivityColor },
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Platform Analytics</h1>
                    <p className="text-muted-foreground">
                        An overview of user activity and platform growth.
                    </p>
                </div>
                <DateRangePicker date={date} onDateChange={setDate} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCreators}</div>
                        <p className="text-xs text-muted-foreground">
                            All-time registered creators
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Sign-ups (24h)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{newSignups}</div>
                        <p className="text-xs text-muted-foreground">
                            In the last 24 hours
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scans Performed</CardTitle>
                        <ScanSearch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalScans.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            In the selected period
                        </p>
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
                        <div className="flex items-center gap-2">
                            <ColorPicker color={userGrowthColor} setColor={setUserGrowthColor} />
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
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            {userGrowthChartType === 'bar' ? (
                                <BarChart accessibilityLayer data={filteredData} barCategoryGap="20%">
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="signups" fill={userGrowthColor} radius={4} />
                                </BarChart>
                            ) : userGrowthChartType === 'line' ? (
                                <LineChart accessibilityLayer data={filteredData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="signups" stroke={userGrowthColor} strokeWidth={2} dot={false} />
                                </LineChart>
                            ) : (
                                <AreaChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
                                    <defs>
                                        <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={userGrowthColor} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={userGrowthColor} stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="signups" stroke={userGrowthColor} fill="url(#fillSignups)" strokeWidth={2} dot={false} />
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
                        <div className="flex items-center gap-2">
                            <ColorPicker color={platformActivityColor} setColor={setPlatformActivityColor} />
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
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            {platformActivityChartType === 'line' ? (
                                <LineChart accessibilityLayer data={filteredData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="scans" stroke={platformActivityColor} strokeWidth={2} dot={false} />
                                </LineChart>
                            ) : platformActivityChartType === 'bar' ? (
                                <BarChart accessibilityLayer data={filteredData} barCategoryGap="20%">
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="scans" fill={platformActivityColor} radius={4} />
                                </BarChart>
                            ) : (
                                <AreaChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
                                     <defs>
                                        <linearGradient id="fillScans" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={platformActivityColor} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={platformActivityColor} stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickMargin={10} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="scans" stroke={platformActivityColor} fill="url(#fillScans)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            )}
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
