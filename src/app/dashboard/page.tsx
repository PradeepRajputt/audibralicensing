
import { getDashboardData } from './actions';
import DashboardClientPage from './dashboard-client-page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogIn } from 'lucide-react';


// This is now an async Server Component
export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  
  // This handles the case where the user is not found or some other critical error.
  if (!dashboardData?.creatorName) {
    return (
        <Card className="w-full max-w-lg mx-auto mt-16 text-center">
            <CardHeader>
                <CardTitle>Authentication Error</CardTitle>
                <CardDescription>We couldn't find your user data. Please try logging in again.</CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/">
                       <LogIn className="mr-2" />
                       Return to Home
                    </Link>
                 </Button>
            </CardFooter>
        </Card>
    )
  }

  // Pass the fetched data to the client component for rendering
  return <DashboardClientPage dashboardData={dashboardData} />;
}
