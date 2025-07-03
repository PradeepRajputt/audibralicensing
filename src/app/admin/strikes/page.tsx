
'use client';

import * as React from 'react';
import { getAllReports } from '@/lib/reports-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StrikesClientPage } from './strikes-client-page';
import type { Report } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function StrikeRequestsPage() {
  const [strikes, setStrikes] = React.useState<Report[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getAllReports().then(rawStrikes => {
      setStrikes(JSON.parse(JSON.stringify(rawStrikes)));
      setIsLoading(false);
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Copyright Strike Requests</CardTitle>
        <CardDescription>
          Review and process copyright strike requests submitted by creators.
        </CardDescription>
      </CardHeader>
      <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <StrikesClientPage initialStrikes={strikes} />
          )}
      </CardContent>
    </Card>
  );
}
