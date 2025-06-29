'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { getReportById, updateReportStatus, type Report } from '@/lib/reports-store';
import { ArrowLeft, Check, X, Loader2, User, Calendar, Link as LinkIcon, FileText } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StrikeDetailsPage({ params }: { params: { strikeId: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const [strike, setStrike] = useState<Report | null | undefined>(undefined);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    const report = getReportById(params.strikeId);
    setStrike(report);
  }, [params.strikeId]);

  const handleAction = (action: 'approve' | 'deny') => {
    if (!strike) return;
    setLoadingAction(action);
    
    updateReportStatus(strike.id, action === 'approve' ? 'approved' : 'rejected');
    
    // After updating, we fetch the latest version to update the UI
    const updatedStrike = getReportById(params.strikeId);
    setStrike(updatedStrike);

    toast({
      title: "Action Successful",
      description: `Strike request has been ${action}d.`,
    });
    
    setLoadingAction(null);
  };

  const getStatusVariant = (status?: Report['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'in_review':
      default: return 'secondary';
    }
  };

  const getStatusText = (status?: Report['status']) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'in_review':
      default: return 'In Review';
    }
  };

  if (strike === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (strike === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Strike Request Not Found</CardTitle>
          <CardDescription>The requested strike could not be found. It may have been deleted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/admin/strikes">
              <ArrowLeft className="mr-2" />
              Back to Strike Requests
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold">Strike Request Details</h1>
         <Button asChild variant="outline">
            <Link href="/admin/strikes">
              <ArrowLeft className="mr-2" />
              Back to List
            </Link>
          </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Report ID: {strike.id.substring(0, 18)}...</CardTitle>
              <CardDescription>Review the details of the report submitted by the creator.</CardDescription>
            </div>
             <Badge variant={getStatusVariant(strike.status)} className="text-base">
                {getStatusText(strike.status)}
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Creator Name</p>
                        <p className="font-medium">{strike.creatorName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Submission Date</p>
                        <p className="font-medium">{new Date(strike.submitted).toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <LinkIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">Infringing URL</p>
                    <a href={strike.suspectUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate block">
                        {strike.suspectUrl}
                    </a>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                <div>
                    <p className="text-sm text-muted-foreground">Reason for Submission</p>
                    <p className="font-medium">{strike.reason}</p>
                </div>
            </div>
        </CardContent>
        {strike.status === 'in_review' && (
             <CardFooter className="border-t pt-6 flex justify-end gap-2">
                 <Button
                    variant="outline"
                    onClick={() => handleAction('approve')}
                    disabled={!!loadingAction}
                  >
                    {loadingAction === `approve` ? <Loader2 className="animate-spin" /> : <Check />}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction('deny')}
                    disabled={!!loadingAction}
                  >
                     {loadingAction === `deny` ? <Loader2 className="animate-spin" /> : <X />}
                    Deny
                  </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
