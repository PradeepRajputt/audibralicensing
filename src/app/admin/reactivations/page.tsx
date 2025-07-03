
'use client';

import * as React from 'react';
import { getAllReactivationRequests } from '@/lib/reactivations-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactivationRequestsClient } from './reactivation-requests-client';
import type { ReactivationRequest } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function ReactivationRequestsPage() {
  const [requests, setRequests] = React.useState<ReactivationRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getAllReactivationRequests().then(rawRequests => {
      setRequests(JSON.parse(JSON.stringify(rawRequests)));
      setIsLoading(false);
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reactivation Requests</CardTitle>
        <CardDescription>
          Review and respond to requests from deactivated creators to rejoin the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ReactivationRequestsClient initialRequests={requests} />
        )}
      </CardContent>
    </Card>
  );
}
