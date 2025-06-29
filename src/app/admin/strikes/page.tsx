'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";
import { approveStrikeRequest, denyStrikeRequest } from './actions';

// Mock data for strike requests. In a real app, this would be fetched from Firestore.
const initialStrikes = [
  {
    strikeId: "strike_1",
    creatorName: "Sample Creator",
    infringingUrl: "https://infringing-site.com/stolen-video-1",
    originalUrl: "https://youtube.com/watch?v=original-1",
    requestDate: "2024-06-10",
  },
  {
    strikeId: "strike_2",
    creatorName: "Alice Vlogs",
    infringingUrl: "https://youtube.com/watch?v=reuploaded",
    originalUrl: "https://youtube.com/watch?v=original-2",
    requestDate: "2024-06-09",
  },
];

type StrikeRequest = typeof initialStrikes[0];

export default function StrikeRequestsPage() {
  const { toast } = useToast();
  const [strikes, setStrikes] = useState(initialStrikes);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: 'approve' | 'deny', strike: StrikeRequest) => {
    setLoadingAction(`${action}-${strike.strikeId}`);
    
    let result;
    if (action === 'approve') {
      result = await approveStrikeRequest(strike.strikeId);
    } else {
      result = await denyStrikeRequest(strike.strikeId);
    }

    if (result.success) {
      toast({
        title: "Action Successful",
        description: result.message,
      });
      // Remove the strike from the list after action
      setStrikes(prev => prev.filter(s => s.strikeId !== strike.strikeId));
    } else {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: result.message || "An unknown error occurred.",
      });
    }

    setLoadingAction(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Copyright Strike Requests</CardTitle>
        <CardDescription>
          Review and process copyright strike requests submitted by creators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {strikes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Infringing URL</TableHead>
                <TableHead>Original URL</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strikes.map((strike) => (
                <TableRow key={strike.strikeId}>
                  <TableCell className="font-medium">{strike.creatorName}</TableCell>
                   <TableCell>
                    <a href={strike.infringingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block max-w-xs">
                        {strike.infringingUrl}
                    </a>
                  </TableCell>
                   <TableCell>
                     <a href={strike.originalUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block max-w-xs">
                        {strike.originalUrl}
                    </a>
                  </TableCell>
                  <TableCell>{new Date(strike.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('approve', strike)}
                        disabled={!!loadingAction}
                      >
                        {loadingAction === `approve-${strike.strikeId}` ? <Loader2 className="animate-spin" /> : <Check />}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction('deny', strike)}
                        disabled={!!loadingAction}
                      >
                         {loadingAction === `deny-${strike.strikeId}` ? <Loader2 className="animate-spin" /> : <X />}
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
            <p>There are no pending strike requests.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
