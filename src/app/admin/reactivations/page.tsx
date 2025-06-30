
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";
import { approveReactivationRequest, denyReactivationRequest, getAllReactivationRequests, type ReactivationRequest } from '@/lib/reactivations-store';


export default function ReactivationRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ReactivationRequest[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    setRequests(getAllReactivationRequests());
  }, []);

  const handleAction = async (action: 'approve' | 'deny', request: ReactivationRequest) => {
    setLoadingAction(`${action}-${request.creatorId}`);
    
    // Simulate async action
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (action === 'approve') {
      approveReactivationRequest(request.creatorId);
    } else {
      denyReactivationRequest(request.creatorId);
    }
    
    setRequests(prev => prev.filter(r => r.creatorId !== request.creatorId));

    toast({
      title: "Action Successful",
      description: `Request for ${request.displayName} has been ${action}d.`,
    });
    
    setLoadingAction(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reactivation Requests</CardTitle>
        <CardDescription>
          Review and respond to requests from deactivated creators to rejoin the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                        Requested on {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Requested on {new Date(request.requestDate).toLocaleDateString()}
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
      </CardContent>
    </Card>
  );
}
