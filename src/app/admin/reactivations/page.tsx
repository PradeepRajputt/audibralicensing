import { getAllReactivationRequests } from '@/lib/reactivations-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactivationRequestsClient } from './reactivation-requests-client';

export default function ReactivationRequestsPage() {
  // Fetch data on the server
  const requests = getAllReactivationRequests();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reactivation Requests</CardTitle>
        <CardDescription>
          Review and respond to requests from deactivated creators to rejoin the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pass server-fetched data to the client component */}
        <ReactivationRequestsClient initialRequests={requests} />
      </CardContent>
    </Card>
  );
}
