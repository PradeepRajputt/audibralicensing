
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { addProtectedContentAction } from './actions';
import { useSession } from "next-auth/react";

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  contentType: z.enum(['video', 'audio', 'text', 'image']),
  platform: z.enum(['youtube', 'vimeo', 'web']),
  videoURL: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  tags: z.string().optional(),
});

export default function AddContentPage() {
  const { data: session, status } = useSession();
  // Show loading spinner until session is loaded
  if (status === 'loading') {
    return <div className="flex justify-center items-center h-48">Loading session...</div>;
  }
  if (!session || !session.user || !session.user.email) {
    return <div className="flex justify-center items-center h-48 text-red-500">You must be logged in to add content.</div>;
  }
  console.log("Session in AddContentPage:", session);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        title: "",
        contentType: "video",
        platform: "youtube",
        videoURL: "",
        tags: ""
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not determine your user account. Please log in again.",
      });
      setIsLoading(false);
      return;
    }
    const res = await fetch('/api/add-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values, userEmail }),
    });
    const result = await res.json();
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: result.message,
      });
    } else {
      // Optionally redirect or show success
      window.location.href = '/dashboard/content';
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Add New Content to Monitor</h1>
        <p className="text-muted-foreground">
            Provide details about the content you want CreatorShield to protect.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="title">Content Title</FormLabel>
                <FormControl>
                  <Input id="title" placeholder="My Epic New Video" {...field} />
                </FormControl>
                <FormDescription>The official title of your content.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contentType">Content Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} name="contentType">
                    <FormControl>
                      <SelectTrigger id="contentType" name="contentType">
                        <SelectValue placeholder="Select the content type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="platform">Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} name="platform">
                    <FormControl>
                      <SelectTrigger id="platform" name="platform">
                        <SelectValue placeholder="Select the original platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="web">Web Page</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="videoURL"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="videoURL">Content URL</FormLabel>
                <FormControl>
                  <Input id="videoURL" placeholder="https://youtube.com/watch?v=your_video_id" {...field} />
                </FormControl>
                 <FormDescription>The direct link to your original content.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="tags">Tags</FormLabel>
                <FormControl>
                  <Input id="tags" placeholder="adventure, travel, vlog" {...field} />
                </FormControl>
                 <FormDescription>Comma-separated tags to help identify your content.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center gap-4">
              <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Content and Begin Monitoring
              </Button>
              <Button variant="outline" asChild>
                  <Link href="/dashboard/content">Cancel</Link>
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
