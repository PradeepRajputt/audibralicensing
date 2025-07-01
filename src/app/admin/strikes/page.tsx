
import { getAllReports } from '@/lib/reports-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StrikesClientPage } from './strikes-client-page';

export default async function StrikeRequestsPage() {
  const strikes = await getAllReports();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Copyright Strike Requests</CardTitle>
        <CardDescription>
          Review and process copyright strike requests submitted by creators.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <StrikesClientPage initialStrikes={strikes} />
      </CardContent>
    </Card>
  );
}
