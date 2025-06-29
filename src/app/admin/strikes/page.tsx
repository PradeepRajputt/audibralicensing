
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2, Eye } from "lucide-react";
import Link from 'next/link';
import type { Report } from '@/lib/reports-store';
import { getAllReports, updateReportStatus } from '@/lib/reports-store';


export default function StrikeRequestsPage() {
  const { toast } = useToast();
  const [strikes, setStrikes] = useState<Report[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  function loadStrikes() {
      setStrikes(getAllReports());
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
    
    updateReportStatus(strikeId, action === 'approve' ? 'approved' : 'rejected');
    toast({
      title: "Action Successful",
      description: `Strike request has been ${action}d.`,
    });
    
    // Refresh the list from our simulated database
    loadStrikes();
    setLoadingAction(null);
  }

  const renderTable = (data: Report[], showActions: boolean) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <p>There are no requests in this category.</p>
        </div>
      );
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Creator</TableHead>
            <TableHead>Infringing URL</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((strike) => (
            <TableRow key={strike.id}>
              <TableCell className="font-medium">{strike.creatorName}</TableCell>
               <TableCell>
                <a href={strike.suspectUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block max-w-xs">
                    {strike.suspectUrl}
                </a>
              </TableCell>
              <TableCell>{new Date(strike.submitted).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {showActions && (
                    <>
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
                    </>
                  )}
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/strikes/${strike.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  const pendingStrikes = strikes.filter(s => s.status === 'in_review');
  const approvedStrikes = strikes.filter(s => s.status === 'approved');
  const rejectedStrikes = strikes.filter(s => s.status === 'rejected');


  return (
    <Card>
      <CardHeader>
        <CardTitle>Copyright Strike Requests</CardTitle>
        <CardDescription>
          Review and process copyright strike requests submitted by creators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">{pendingStrikes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              <Badge variant="default" className="ml-2">{approvedStrikes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              <Badge variant="destructive" className="ml-2">{rejectedStrikes.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            {renderTable(pendingStrikes, true)}
          </TabsContent>
          <TabsContent value="approved" className="mt-4">
            {renderTable(approvedStrikes, false)}
          </TabsContent>
          <TabsContent value="rejected" className="mt-4">
            {renderTable(rejectedStrikes, false)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
