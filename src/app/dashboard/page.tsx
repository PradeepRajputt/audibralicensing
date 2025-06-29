import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldCheck, Youtube } from "lucide-react";

const recentActivities = [
  {
    type: "New Infringement Detected",
    details: "On website 'example.com/stolen-video'",
    status: "Action Required",
    date: "2 hours ago",
    variant: "destructive"
  },
  {
    type: "YouTube Scan Complete",
    details: "Channel 'MyAwesomeVlogs' scanned.",
    status: "No Issues",
    date: "1 day ago",
    variant: "default"
  },
  {
    type: "Strike Submitted",
    details: "Claim #CS-12345 to YouTube.",
    status: "Pending",
    date: "2 days ago",
    variant: "secondary"
  },
];


export default function CreatorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Views
            </CardTitle>
            <Youtube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234,567</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Monitors
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
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
          <CardDescription>A log of recent automated scans and actions.</CardDescription>
        </CardHeader>
        <CardContent>
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
              {recentActivities.map((activity, index) => (
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
        </CardContent>
      </Card>
    </div>
  )
}
