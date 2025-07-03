
import { getAllReports } from '@/lib/reports-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StrikesClientPage } from './strikes-client-page';
import type { Report } from '@/lib/types';

export default async function StrikeRequestsPage() {
  const rawStrikes = await getAllReports();
  const strikes = JSON.parse(JSON.stringify(rawStrikes)) as Report[];
  
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
