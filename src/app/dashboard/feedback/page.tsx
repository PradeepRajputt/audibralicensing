'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Form, FormControl, FormDescription, FormField,
  FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addFeedback, markFeedbackAsRead, getFeedbackForUser } from '@/lib/feedback-store';
import type { Feedback } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ClientFormattedDate } from '@/components/ui/client-formatted-date';
import { useSession } from "next-auth/react";

const feedbackFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  rating: z.number().min(1, { message: 'Please provide a rating.' }).max(5),
  tags: z.string().optional(), // will refine below
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  message: z.string().optional(), // always optional
  type: z.enum(['general', 'disconnect-request']),
}).superRefine((data, ctx) => {
  if (data.type === 'general' && (!data.tags || data.tags.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tags are required for general feedback.',
      path: ['tags'],
    });
  }
});

function getUserEmail(session: any) {
  let email = session?.user?.email;
  if (!email && typeof window !== "undefined") {
    const token = localStorage.getItem("creator_jwt");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        email = decoded.email;
      } catch (e) {
        console.error('JWT decode error:', e);
      }
    }
  }
  return email;
}

function getStatusBadge(status: string) {
  let color = 'bg-yellow-200 text-yellow-800';
  let label = status;
  if (status === 'approved' || status === 'admin read') {
    color = 'bg-green-200 text-green-800';
    if (status === 'admin read') label = 'admin read';
  }
  if (status === 'rejected') color = 'bg-red-200 text-red-800';
  return (
    <span className={`text-xs px-2 py-1 rounded font-semibold ${color} w-fit text-center`}>
      {label}
    </span>
  );
}

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [history, setHistory] = React.useState<Feedback[]>([]);
  const { toast } = useToast();
  const [disconnectRequest, setDisconnectRequest] = React.useState(false);
  const feedbackType = disconnectRequest ? 'disconnect-request' : 'general';
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      title: '',
      rating: 1,
      tags: '',
      description: '',
      message: '',
      type: feedbackType,
    },
  });

  // Set userEmail only on client
  React.useEffect(() => {
    setUserEmail(getUserEmail(session));
  }, [session]);

  React.useEffect(() => {
    if (disconnectRequest) {
      form.setValue('title', 'Request to disconnect/change my YouTube channel');
      form.setValue('description', 'I have connected the wrong YouTube channel and need admin approval to disconnect or change it. Please review my request.');
      form.setValue('tags', 'disconnect, youtube, admin');
      form.setValue('rating', 5);
    } else {
      form.reset({
        title: '',
        rating: 1,
        tags: '',
        description: '',
        message: '',
        type: 'general',
      });
    }
  }, [disconnectRequest]);

  const loadHistory = React.useCallback(async () => {
    if (!userEmail) return;
    const userFeedback = await getFeedbackForUser(userEmail);
    setHistory(userFeedback);
  }, [userEmail]);

  React.useEffect(() => {
    if (userEmail) loadHistory();
  }, [userEmail, loadHistory]);

  async function onSubmit(values: z.infer<typeof feedbackFormSchema>) {
    setIsLoading(true);
    if (!userEmail) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not logged in.' });
      setIsLoading(false);
      return;
    }

    const feedbackData = {
      creatorEmail: userEmail,
      creatorName: session?.user?.name || 'Sample Creator',
      title: values.title,
      rating: values.rating,
      tags: values.tags,
      description: values.description,
      message: values.message || '',
      type: values.type,
      status: 'pending',
    };

    try {
      const result = await addFeedback(feedbackData);
      if (result.success) {
        toast({ title: 'Feedback Submitted!', description: 'Thank you for helping us improve CreatorShield.' });
        form.reset({
          title: '',
          rating: 1,
          tags: '',
          description: '',
          message: '',
          type: 'general',
        });
        setDisconnectRequest(false);
        await loadHistory();
      } else {
        toast({ variant: 'destructive', title: 'Submission Failed', description: result.message });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: err?.message || 'Unknown error' });
    }
    setIsLoading(false);
  }

  const handleMarkAsRead = async (feedbackId: string) => {
    if (!userEmail) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not logged in.' });
      return;
    }
    await markFeedbackAsRead(feedbackId);
    loadHistory();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Feedback</CardTitle>
          <CardDescription>Have a suggestion or encountered an issue? Let us know.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row gap-2">
            <Button variant={disconnectRequest ? 'default' : 'outline'} onClick={() => {
              setDisconnectRequest(true);
              form.setValue('type', 'disconnect-request');
            }}>
              Request to disconnect/change my YouTube channel
            </Button>
            <Button variant={!disconnectRequest ? 'default' : 'outline'} onClick={() => {
              setDisconnectRequest(false);
              form.setValue('type', 'general');
            }}>
              General Feedback
            </Button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Form {...form}>
              {/* Hidden Field for Feedback Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => <input type="hidden" {...field} value={feedbackType} />}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Rating <span style={{color: 'red'}}>*</span></FormLabel>
                    <FormControl>
                      <StarRating rating={field.value} setRating={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title <span style={{color: 'red'}}>*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Feature request for..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tags
                      {form.getValues('type') === 'general'
                        ? <span style={{color: 'red'}}> *</span>
                        : <span style={{color: '#888', fontWeight: 400}}> (optional)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., analytics, bug, feature" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated tags to categorize your feedback.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description <span style={{color: 'red'}}>*</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Please describe your feedback in detail..." className="resize-y" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Message to Admin <span style={{color: '#888', fontWeight: 400}}> (optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Private message for admin..." className="resize-y" {...field} />
                    </FormControl>
                    <FormDescription>This message will only be visible to administrators.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </Form>
          </form>
        </CardContent>
      </Card>

      {/* Feedback History */}
      <Card>
        <CardHeader>
          <CardTitle>My Feedback History</CardTitle>
          <CardDescription>View your past submissions and responses from our team.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div>
              <div className="grid grid-cols-3 gap-2 px-2 pb-1 text-xs font-normal text-muted-foreground">
                <span className="text-left">Type</span>
                <span className="text-center">Status</span>
                <span className="text-right">Submitted Date</span>
              </div>
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item.feedbackId} className="border p-4 rounded-md">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="font-semibold capitalize text-left">{item.type.replace('-', ' ')}</span>
                      <div className="flex justify-center">
                        {getStatusBadge((item as any).status || 'pending')}
                      </div>
                      <span className="text-sm text-muted-foreground text-right"><ClientFormattedDate dateString={(item as any).createdAt || item.timestamp || ''} /></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>You have not submitted any feedback yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}