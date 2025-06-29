
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";
import type { Report } from '@/lib/reports-store';
import { getPendingStrikeRequests, updateReportStatus } from '@/lib/reports-store';


export default function StrikeRequestsPage() {
  const { toast } = useToast();
  const [strikes, setStrikes] = useState<Report[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  function loadStrikes() {
      setStrikes(getPendingStrikeRequests());
  }

  useEffect(() => {
    loadStrikes();

    // Listen for storage changes to update the list in real-time if another tab makes a change
    window.addEventListener('storage', loadStrikes);
    return () => {
      window.removeEventListener('storage', loadStrikes);
    };
  }, []);


  const handleAction = (action: 'approve' | 'deny', strikeId: string) => {
    setLoadingAction(`${action}-${strikeId}`);
    
    if (action === 'approve') {
      updateReportStatus(strikeId, 'approved');
      toast({
        title: "Action Successful",
        description: 'Strike request has been approved and takedown initiated.',
      });
    } else {
      updateReportStatus(strikeId, 'rejected');
      toast({
        title: "Action Successful",
        description: 'Strike request has been denied.',
      });
    }
    
    // Refresh the list from our simulated database
    loadStrikes();
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
                <TableHead>Reason</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strikes.map((strike) => (
                <TableRow key={strike.id}>
                  <TableCell className="font-medium">{strike.creatorName}</TableCell>
                   <TableCell>
                    <a href={strike.suspectUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block max-w-xs">
                        {strike.suspectUrl}
                    </a>
                  </TableCell>
                   <TableCell className="truncate max-w-xs">{strike.reason}</TableCell>
                  <TableCell>{new Date(strike.submitted).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('approve', strike.id)}
                        disabled={!!loadingAction}
                      >
                        {loadingAction === `approve-${strike.id}` ? <Loader2 className="animate-spin" /> : <Check />}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction('deny', strike.id)}
                        disabled={!!loadingAction}
                      >
                         {loadingAction === `deny-${strike.id}` ? <Loader2 className="animate-spin" /> : <X />}
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
