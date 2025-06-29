'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, Eye, Video } from 'lucide-react';

const monthlyViewsData = [
  { month: 'Jan', views: 18600 },
  { month: 'Feb', views: 30500 },
  { month: 'Mar', views: 23700 },
  { month: 'Apr', views: 27800 },
  { month: 'May', views: 18900 },
  { month: 'Jun', views: 23900 },
];

const subscriberData = [
    { date: "2024-01-01", count: 4000 },
    { date: "2024-02-01", count: 4250 },
    { date: "2024-03-01", count: 4800 },
    { date: "2024-04-01", count: 5100 },
    { date: "2024-05-01", count: 5500 },
    { date: "2024-06-01", count: 6200 },
];

const chartConfig = {
  views: {
    label: 'Views',
    color: 'hsl(var(--chart-1))',
  },
  subscribers: {
    label: "Subscribers",
    color: "hsl(var(--chart-2))",
  }
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,241</div>
            <p className="text-xs text-muted-foreground">+12.4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234,567</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Viewed Video</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">My Most Epic Adventure Yet!</div>
            <p className="text-xs text-muted-foreground">152,482 views</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Views</CardTitle>
            <CardDescription>Total views for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={monthlyViewsData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                    tickFormatter={(value) => `${Number(value) / 1000}k`}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="views" fill="var(--color-views)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
            <CardDescription>Subscriber count over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart accessibilityLayer data={subscriberData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis
                    tickFormatter={(value) => `${Number(value) / 1000}k`}
                />
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
