
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X, Loader2, User, Calendar, Link as LinkIcon, FileText, Send } from "lucide-react";
import Link from 'next/link';
import type { Report } from '@/lib/types';
import { approveStrikeRequest, denyStrikeRequest } from '../actions';

export default function StrikeDetailsClientPage({ initialStrike }: { initialStrike: Report | undefined }) {
  const { toast } = useToast();
  const [strike, setStrike] = useState<Report | undefined>(initialStrike);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    setStrike(initialStrike);
  }, [initialStrike]);


  const handleAction = async (action: 'approve' | 'deny') => {
    if (!strike) return;
    setLoadingAction(action);
    
    const result = action === 'approve' 
      ? await approveStrikeRequest(strike.id) 
      : await denyStrikeRequest(strike.id);

    if (result.success) {
      toast({
        title: "Action Successful",
        description: result.message,
      });
      // Optimistically update status
      setStrike(prev => prev ? { ...prev, status: action === 'approve' ? 'approved' : 'rejected' } : undefined);
    } else {
      toast({
          variant: 'destructive',
          title: "Action Failed",
          description: result.message
      });
    }
    
    setLoadingAction(null);
  };

  const getStatusVariant = (status?: Report['status']) => {
    switch (status) {
      case 'approved':
      case 'action_taken':
        return 'default';
      case 'rejected': return 'destructive';
      case 'in_review':
      default: return 'secondary';
    }
  };

  const getStatusText = (status?: Report['status']) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'action_taken': return 'Action Taken';
      case 'in_review':
      default: return 'In Review';
    }
  };

  if (!strike) {
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
        <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div>
                    <p className="text-sm text-muted-foreground">Creator Name</p>
                    <p className="font-medium">{strike.creatorName}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div>
                    <p className="text-sm text-muted-foreground">Submission Date</p>
                    <p className="font-medium">{new Date(strike.submitted).toLocaleString()}</p>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <LinkIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div>
                    <p className="text-sm text-muted-foreground">Original Content</p>
                    <a href={strike.originalContentUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline break-all">
                        {strike.originalContentTitle}
                    </a>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <LinkIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div>
                    <p className="text-sm text-muted-foreground">Infringing URL</p>
                    <a href={strike.suspectUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline break-all">
                        {strike.suspectUrl}
                    </a>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <FileText className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                    <p className="text-sm text-muted-foreground">Reason for Submission</p>
                    <p className="font-medium whitespace-pre-wrap">{strike.reason}</p>
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
         {strike.status === 'approved' && strike.platform === 'youtube' && (
             <CardFooter className="border-t pt-6 flex justify-end gap-2">
                 <Button asChild>
                    <Link href={`/admin/youtube-consent/${strike.id}`}>
                        <Send className="mr-2 h-4 w-4" />
                        Submit to YouTube
                    </Link>
                 </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
