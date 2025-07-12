
'use client';

import * as React from 'react';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Bar, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Users, ScanSearch, Gavel, UserCheck } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getAdminOverviewStats } from '@/lib/admin-stats';

type ChartType = 'area' | 'bar' | 'line';

export default function AdminOverviewPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });
    const [userGrowthChartType, setUserGrowthChartType] = React.useState<ChartType>('area');
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        getAdminOverviewStats(date?.from, date?.to).then((data) => {
            setStats(data);
            setLoading(false);
        });
    }, [date]);

    if (loading || !stats) {
        return <div className="p-8 text-center text-lg">Loading real admin stats...</div>;
    }

    const filteredData = stats.chartData;
    const totalSignups = stats.totalSignups;
    const totalScans = stats.totalScans;
    const totalReports = stats.totalReports;
    const totalCreators = stats.totalCreators;
    const pendingStrikes = stats.pendingStrikes;
    const pendingReactivations = stats.pendingReactivations;

    const chartConfig = {
        signups: { label: 'Sign-ups', color: 'hsl(var(--chart-1))' },
        scans: { label: "Scans", color: "hsl(var(--chart-2))" },
        reports: { label: "Reports", color: "hsl(var(--chart-3))" }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Admin Overview</h1>
                    <p className="text-muted-foreground">
                        A high-level summary of platform activity.
                    </p>
                </div>
                <DateRangePicker date={date} onDateChange={setDate} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                        <CardTitle className="text-sm font-medium">Pending Strikes</CardTitle>
                        <Gavel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingStrikes}</div>
                        <p className="text-xs text-muted-foreground">
                            <Link href="/admin/strikes" className="hover:underline">Needs review</Link>
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reactivations</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingReactivations}</div>
                        <p className="text-xs text-muted-foreground">
                             <Link href="/admin/reactivations" className="hover:underline">Needs approval</Link>
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scans Performed</CardTitle>
                        <ScanSearch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalScans}</div>
                        <p className="text-xs text-muted-foreground">
                            In the selected period
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4 max-w-xs">
                        <div>
                            <CardTitle>User Growth</CardTitle>
                            <CardDescription>New creator sign-ups over the selected period: +{totalSignups}</CardDescription>
                        </div>
                        <Select value={userGrowthChartType} onValueChange={(value: ChartType) => setUserGrowthChartType(value)}>
                            <SelectTrigger className="w-[120px] min-w-[120px] truncate flex-shrink-0">
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
                            <CardDescription>Reports submitted and scans performed per day.</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm"><Link href="/admin/analytics">View Details</Link></Button>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                           <LineChart accessibilityLayer data={filteredData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={10} />
                                <YAxis yAxisId="left" tickMargin={10} />
                                <YAxis yAxisId="right" orientation="right" tickMargin={10} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line yAxisId="left" type="monotone" dataKey="scans" stroke="var(--color-scans)" strokeWidth={2} dot={false} />
                                <Line yAxisId="right" type="monotone" dataKey="reports" stroke="var(--color-reports)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
