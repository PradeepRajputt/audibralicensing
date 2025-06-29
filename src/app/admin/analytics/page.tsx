'use client';

import * as React from 'react';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Users, ScanSearch, UserPlus } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

// Mock data generation
const generateMockData = () => {
  const data = [];
  // Generate data for the last 90 days
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

export default function AdminAnalyticsPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const filteredData = React.useMemo(() => {
        if (!date?.from) return [];
        // Set end of day for 'to' date to include all data on that day
        const toDate = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : new Date(date.from.setHours(23, 59, 59, 999));
        
        return allData.filter(d => {
            const dDate = new Date(d.date);
            return dDate >= date.from! && dDate <= toDate;
        })
    }, [date]);

    const totalSignups = filteredData.reduce((acc, curr) => acc + curr.signups, 0);
    const totalScans = filteredData.reduce((acc, curr) => acc + curr.scans, 0);

    const chartConfig = {
        signups: { label: 'Sign-ups', color: 'hsl(var(--chart-1))' },
        scans: { label: "Scans", color: "hsl(var(--chart-2))" }
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
                        <div className="text-2xl font-bold">4,821</div>
                        <p className="text-xs text-muted-foreground">
                            All-time registered creators
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Sign-ups</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalSignups}</div>
                        <p className="text-xs text-muted-foreground">
                            In the selected period
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
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>New creator sign-ups over the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart accessibilityLayer data={filteredData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Activity</CardTitle>
                        <CardDescription>Automated scans performed per day.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <LineChart accessibilityLayer data={filteredData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="scans" stroke="var(--color-scans)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
