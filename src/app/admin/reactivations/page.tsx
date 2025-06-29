'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";
import { approveReactivationRequest, denyReactivationRequest } from './actions';

// Mock data for reactivation requests. In a real app, this would be fetched from Firestore.
const initialRequests = [
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.creatorId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.avatar} data-ai-hint="profile picture" />
                        <AvatarFallback>{request.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{request.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>There are no pending reactivation requests.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
