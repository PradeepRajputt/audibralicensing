
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldAlert, Activity, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const googleIdSet = !!process.env.GOOGLE_CLIENT_ID;
  const googleSecretSet = !!process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthSecretSet = !!process.env.NEXTAUTH_SECRET;
  const allEnvVarsSet = googleIdSet && googleSecretSet && nextAuthSecretSet;

  return (
    <div className="space-y-6">

      {!allEnvVarsSet && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Action Required: Missing Configuration
            </CardTitle>
            <CardDescription>
              The application is missing critical environment variables required for Google Authentication. The sign-in process will fail until this is resolved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please add the following variables to your <code className="bg-muted px-1 py-0.5 rounded">.env</code> file:</p>
            <ul className="list-disc space-y-2 pl-5 font-mono text-sm">
              <li>
                <span className={googleIdSet ? '' : 'text-destructive'}>
                  GOOGLE_CLIENT_ID
                </span>
                {googleIdSet ? ' (Set)' : ' (Missing)'}
              </li>
              <li>
                <span className={googleSecretSet ? '' : 'text-destructive'}>
                  GOOGLE_CLIENT_SECRET
                </span>
                {googleSecretSet ? ' (Set)' : ' (Missing)'}
              </li>
              <li>
                <span className={nextAuthSecretSet ? '' : 'text-destructive'}>
                  NEXTAUTH_SECRET
                </span>
                {nextAuthSecretSet ? ' (Set)' : ' (Missing)'}
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              You can obtain the Client ID and Secret from the "Credentials" page of your project in the Google Cloud Console. NEXTAUTH_SECRET can be a random string. Once you update the <code className="bg-muted px-1 py-0.5 rounded">.env</code> file, please restart the server.
            </p>
          </CardContent>
        </Card>
      )}


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
