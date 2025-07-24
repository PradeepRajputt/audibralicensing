
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import type { Feedback, FeedbackReply } from '@/lib/types';
import { getAllFeedbackFromDb, approveDisconnectForCreator, isDisconnectApproved } from '@/lib/feedback-store';
import { replyToFeedbackAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { ClientFormattedDate } from '@/components/ui/client-formatted-date';

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = React.useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = React.useState<Feedback | null>(null);
  const [isReplying, setIsReplying] = React.useState(false);
  const [replyMessage, setReplyMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const [filterType, setFilterType] = React.useState<'all' | 'general' | 'disconnect-request'>('all');

  const loadFeedback = React.useCallback(async () => {
    try {
      const data = await getAllFeedbackFromDb();
      setFeedbackList(JSON.parse(JSON.stringify(data)));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load feedback',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleReplySubmit = async () => {
    if (!selectedFeedback || !replyMessage.trim()) return;
    setIsReplying(true);

    const result = await replyToFeedbackAction(selectedFeedback.feedbackId, replyMessage);

    if (result.success) {
      toast({
        title: 'Reply Sent',
        description: 'Your response has been sent to the creator.',
      });
      setSelectedFeedback(null);
      setReplyMessage('');
      loadFeedback(); // Refresh list
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Reply',
        description: result.message,
      });
    }
    setIsReplying(false);
  };
  
  const handleApproveDisconnect = async (creatorId: string) => {
    approveDisconnectForCreator(creatorId);
    toast({ title: 'Disconnect Approved', description: 'The creator can now disconnect their channel.' });
    setSelectedFeedback(null);
    loadFeedback();
  };

  const handleMarkAsRead = async (feedbackId: string) => {
    // Assuming markFeedbackAsRead is an action that updates the feedback in the store
    // This part of the logic needs to be implemented based on how markFeedbackAsRead is handled
    // For now, we'll just update the state to reflect it's read
    setFeedbackList(prev => prev.map(item => 
      item.feedbackId === feedbackId ? { ...item, isReadByCreator: true } : item
    ));
    toast({ title: 'Marked as Read', description: 'Feedback marked as read.' });
  };

  const getStatus = (item: Feedback) => {
    if (Array.isArray(item.response) && item.response.length > 0 && !item.isReadByCreator) {
        return <Badge variant="outline">Replied</Badge>;
    }
    if (Array.isArray(item.response) && item.response.length > 0 && item.isReadByCreator) {
        return <Badge variant="secondary">Read</Badge>;
    }
    return <Badge variant="default">New</Badge>;
  }

  if (isLoading) {
    return (
       <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
    )
  }

  // Defensive: ensure feedbackList is always an array
  const safeFeedbackList = Array.isArray(feedbackList) ? feedbackList : [];
  // Filter feedbacks by type
  const filteredFeedbackList = safeFeedbackList.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'general') return item.type === 'general';
    if (filterType === 'disconnect-request') return item.type === 'disconnect-request';
    return true;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Creator Feedback</CardTitle>
          <CardDescription>
            Review and respond to feedback submitted by creators.
          </CardDescription>
        </CardHeader>
        <CardContent>
         <div className="mb-4 flex gap-2">
           <Button variant={filterType === 'all' ? 'default' : 'outline'} onClick={() => setFilterType('all')}>All</Button>
           <Button variant={filterType === 'general' ? 'default' : 'outline'} onClick={() => setFilterType('general')}>General</Button>
           <Button variant={filterType === 'disconnect-request' ? 'default' : 'outline'} onClick={() => setFilterType('disconnect-request')}>Disconnect/Change Requests</Button>
         </div>
          {feedbackList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbackList.map((item, index) => (
                  <TableRow
                    key={item._id?.toString?.() || item.feedbackId || index}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      // Convert ObjectId fields to string before setting state
                      setSelectedFeedback({
                        ...item,
                        _id: item._id?.toString?.() || item.feedbackId || index,
                        creatorId: item.creatorId?.toString?.() || item.creatorId,
                      });
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={item.avatar || item.creator?.avatar || item.youtubeChannel?.thumbnail || item.creator?.youtubeChannel?.thumbnail} data-ai-hint="profile picture" />
                          <AvatarFallback></AvatarFallback>
                        </Avatar>
                        <span>{item.creatorName || item.creator?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      {getStatus(item)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-muted-foreground">{item.type === 'disconnect-request' ? 'Disconnect Request' : 'General'}</span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      <ClientFormattedDate dateString={item.createdAt || item.timestamp || ''} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>There is no feedback to display yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFeedback?.title}</DialogTitle>
            <DialogDescription>
              Feedback from {selectedFeedback?.creatorName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="flex items-center gap-2">
                <span className="font-semibold">Rating:</span>
                <StarRating rating={selectedFeedback?.rating ?? 0} readOnly />
            </div>
             <div className="flex items-center gap-2">
                <span className="font-semibold">Tags:</span>
                <div className="flex flex-wrap gap-1">
                {(Array.isArray(selectedFeedback?.tags)
                  ? selectedFeedback.tags
                  : (selectedFeedback?.tags ? selectedFeedback.tags.split(',').map(t => t.trim()) : [])
                ).map(tag => <Badge key={tag} variant={tag === 'disconnect' ? 'destructive' : 'secondary'}>{tag}</Badge>)}
                </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Description:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedFeedback?.description}</p>
            </div>
            {selectedFeedback?.message && (
               <div>
                <h4 className="font-semibold mb-1">Private Message to Admin:</h4>
                <p className="text-sm text-muted-foreground italic bg-muted/50 p-2 rounded-md">{selectedFeedback.message}</p>
              </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea id="reply" placeholder="Type your response here..." value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} />
            </div>
            {selectedFeedback?.type === 'disconnect-request' && (
              <div className="mt-4 flex gap-2">
                <Button variant="destructive" onClick={() => handleApproveDisconnect(selectedFeedback.creatorId)}>
                  Disconnect Approval
                </Button>
                <Button variant="secondary" onClick={() => handleMarkAsRead(selectedFeedback.feedbackId)}>
                  Mark as Read
                </Button>
              </div>
            )}
            {selectedFeedback?.type !== 'disconnect-request' && (
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" onClick={() => handleMarkAsRead(selectedFeedback.feedbackId)}>
                  Mark as Read
                </Button>
              </div>
            )}
            {selectedFeedback?.response && selectedFeedback.response.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Reply History</h4>
                <div className="space-y-3">
                  {selectedFeedback.response.map((reply: FeedbackReply) => (
                    <div key={reply.replyId} className="text-xs text-muted-foreground border-l-2 pl-3">
                        <p className="font-semibold text-foreground">{reply.adminName} replied on <ClientFormattedDate dateString={reply.timestamp} /></p>
                        <p className="whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleReplySubmit} disabled={isReplying}>
              {isReplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
