'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";
import { approveReactivationRequest, denyReactivationRequest } from './actions';

// Mock data for reactivation requests. In a real app, this would be fetched from Firestore.
const initialRequests = [
  {
    creatorId: "user_creator_wlallah",
    displayName: "Online Wlallah",
    email: "guddumis003@gmail.com",
    avatar: "https://placehold.co/128x128.png",
    requestDate: "2024-06-12",
  },
  {
    creatorId: "user_creator_789",
    displayName: "Bob Builds",
    email: "bob@example.com",
    avatar: "https://placehold.co/128x128.png",
    requestDate: "2024-06-01",
  },
  {
    creatorId: "user_creator_xyz",
    displayName: "Deleted User",
    email: "deleted@example.com",
    avatar: "https://placehold.co/128x128.png",
    requestDate: "2024-05-28",
  },
];

type Request = typeof initialRequests[0];

export default function ReactivationRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: 'approve' | 'deny', request: Request) => {
    setLoadingAction(`${action}-${request.creatorId}`);
    
    let result;
    if (action === 'approve') {
      result = await approveReactivationRequest(request.creatorId, request.email, request.displayName);
    } else {
      result = await denyReactivationRequest(request.creatorId, request.email, request.displayName);
    }

    if (result.success) {
      toast({
        title: "Action Successful",
        description: result.message,
      });
      // Remove the request from the list after action
      setRequests(prev => prev.filter(r => r.creatorId !== request.creatorId));
    } else {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: result.message,
      });
    }

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
