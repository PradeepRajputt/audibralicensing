
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";
import { approveReactivationRequest, denyReactivationRequest } from './actions';
import type { ReactivationRequest } from '@/lib/types';

// A small component to safely render dates on the client to avoid hydration mismatch
const ClientFormattedDate = ({ dateString }: { dateString: string }) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        // This will only run on the client, after the initial render.
        setFormattedDate(new Date(dateString).toLocaleDateString());
    }, [dateString]);

    // Render nothing on the server and initial client render to prevent mismatch
    return <>{formattedDate}</>;
};

export function ReactivationRequestsClient({ initialRequests }: { initialRequests: ReactivationRequest[] }) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ReactivationRequest[]>(initialRequests);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: 'approve' | 'deny', request: ReactivationRequest) => {
    setLoadingAction(`${action}-${request.creatorId}`);
    
    const result = action === 'approve' 
      ? await approveReactivationRequest(request.creatorId, request.email, request.displayName)
      : await denyReactivationRequest(request.creatorId, request.email, request.displayName);
    
    if (result.success) {
        toast({
          title: "Action Successful",
          description: result.message,
        });
        setRequests(prev => prev.filter(r => r.creatorId !== request.creatorId));
    } else {
        toast({
            variant: 'destructive',
            title: 'Action Failed',
            description: result.message
        });
    }
    
    setLoadingAction(null);
  }

  return (
    <>
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.creatorId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={request.avatar} data-ai-hint="profile picture" />
                  <AvatarFallback>{request.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.displayName}</p>
                  <p className="text-sm text-muted-foreground">{request.email}</p>
                  <p className="text-sm text-muted-foreground sm:hidden mt-1">
                      Requested on <ClientFormattedDate dateString={request.requestDate} />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Requested on <ClientFormattedDate dateString={request.requestDate} />
                </p>
                <div className="flex justify-end gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('approve', request)}
                    disabled={!!loadingAction}
                  >
                    {loadingAction === `approve-${request.creatorId}` ? <Loader2 className="animate-spin" /> : <Check />}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction('deny', request)}
                    disabled={!!loadingAction}
                  >
                      {loadingAction === `deny-${request.creatorId}` ? <Loader2 className="animate-spin" /> : <X />}
                    Deny
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <p>There are no pending reactivation requests.</p>
        </div>
      )}
    </>
  );
}
