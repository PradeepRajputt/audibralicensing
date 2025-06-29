import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldAlert, Activity, Info } from "lucide-react";

export default function AdminDashboardPage() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return (
    <div className="space-y-6">

      <Card className="border-blue-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Your Firebase Project ID
          </CardTitle>
          <CardDescription>Use this ID to find your project in the Firebase Console. You can ask me to remove this card once you have it.</CardDescription>
        </CardHeader>
        <CardContent>
          {projectId ? (
            <p className="text-lg font-mono bg-muted p-3 rounded-md inline-block">{projectId}</p>
          ) : (
            <p className="text-muted-foreground">Project ID is not set in your environment variables.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,821</div>
            <p className="text-xs text-muted-foreground">
              +180 since last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Strike Reviews
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+42</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin action
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2.1k</div>
            <p className="text-xs text-muted-foreground">
              Scans performed this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>An overview of the platform's core services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-muted-foreground">All systems operational.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
