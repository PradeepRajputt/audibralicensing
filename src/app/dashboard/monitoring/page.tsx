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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { monitorWebPagesForCopyrightInfringements } from "@/ai/flows/monitor-web-pages";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  creatorContent: z.string().min(50, {
    message: "Please provide at least 50 characters of your content.",
  }),
});

export default function MonitoringPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      creatorContent: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await monitorWebPagesForCopyrightInfringements(values);
      setReport(result.infringementReport);
    } catch (error) {
      console.error("Error monitoring web page:", error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to scan the web page. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monitor a Web Page</CardTitle>
          <CardDescription>
            Enter a URL and your content to scan for potential copyright infringements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Web Page URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/page" {...field} />
                    </FormControl>
                    <FormDescription>
                      The URL of the page you want to scan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creatorContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste a sample of your original text content here..."
                        className="resize-y min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a representative sample of your work for comparison.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Scan Page
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Scanning page... This may take a moment.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Infringement Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{report}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
