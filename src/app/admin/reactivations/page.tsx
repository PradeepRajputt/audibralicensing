
import { getAllReactivationRequests } from '@/lib/reactivations-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactivationRequestsClient } from './reactivation-requests-client';

export default async function ReactivationRequestsPage() {
  const requests = await getAllReactivationRequests();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reactivation Requests</CardTitle>
        <CardDescription>
          Review and respond to requests from deactivated creators to rejoin the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReactivationRequestsClient initialRequests={requests} />
      </CardContent>
    </Card>
  );
}
