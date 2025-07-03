
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { submitFeedbackAction, markAsReadAction } from './actions';
import { getFeedbackForUser } from '@/lib/feedback-store';
import type { Feedback } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ClientFormattedDate } from '@/components/ui/client-formatted-date';

const feedbackFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  rating: z.number().min(1, { message: 'Please provide a rating.' }).max(5),
  tags: z.string().optional(),
  description: z
    .string()
    .min(20, { message: 'Description must be at least 20 characters.' }),
  message: z.string().optional(),
});

export default function FeedbackPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [history, setHistory] = React.useState<Feedback[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      title: '',
      rating: 0,
      tags: '',
      description: '',
      message: '',
    },
  });

  const loadHistory = React.useCallback(async () => {
    // In a real app, this would be from the session
    const userId = "user_creator_123";
    const userFeedback = await getFeedbackForUser(userId);
    setHistory(userFeedback);
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);
  
  async function onSubmit(values: z.infer<typeof feedbackFormSchema>) {
    setIsLoading(true);
    const result = await submitFeedbackAction(values);
    if (result.success) {
      toast({
        title: 'Feedback Submitted!',
        description: 'Thank you for helping us improve CreatorShield.',
      });
      form.reset();
      loadHistory(); // Refresh history
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: result.message,
      });
    }
    setIsLoading(false);
  }

  const handleMarkAsRead = async (feedbackId: string) => {
    const result = await markAsReadAction(feedbackId);
    if(result.success) {
        loadHistory();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Feedback</CardTitle>
          <CardDescription>
            Have a suggestion or encountered an issue? Let us know.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Rating</FormLabel>
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
                    <FormLabel>Title</FormLabel>
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
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., analytics, bug, feature" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated tags to categorize your feedback.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
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
                    <FormLabel>Optional Message to Admin</FormLabel>
                    <FormControl>
                        <Textarea placeholder="If you have a private message for the admin team, enter it here." className="resize-y" {...field} />
                    </FormControl>
                     <FormDescription>
                      This message will only be visible to administrators.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>My Feedback History</CardTitle>
            <CardDescription>View your past submissions and responses from our team.</CardDescription>
        </CardHeader>
        <CardContent>
            {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(item => (
                        <div key={item.feedbackId} className="border p-4 rounded-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground"><ClientFormattedDate dateString={item.timestamp} /></p>
                                </div>
                                <StarRating rating={item.rating} readOnly />
                            </div>
                           
                            <p className="text-sm my-2">{item.description}</p>
                            
                            {item.response.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-semibold mb-2">Admin Response</h4>
                                 {item.response.map(reply => (
                                     <div key={reply.replyId} className="bg-muted/50 p-3 rounded-md">
                                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                                     </div>
                                 ))}
                                {!item.isReadByCreator && (
                                    <Button size="sm" variant="outline" className="mt-2" onClick={() => handleMarkAsRead(item.feedbackId)}>
                                        Mark as Read
                                    </Button>
                                )}
                                </div>
                            )}
                        </div>
                    ))}
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
