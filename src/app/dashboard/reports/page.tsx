
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Report } from "@/lib/types";
import { getReportsForUser } from "@/lib/reports-store";
import { submitManualReportAction } from './actions';

const formSchema = z.object({
  platform: z.string({ required_error: "Please select a platform." }).min(1, "Please select a platform."),
  suspectUrl: z.string().url({ message: "Please enter a valid URL." }),
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
});


export default function SubmitReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [submittedReports, setSubmittedReports] = useState<Report[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        suspectUrl: "",
        reason: "",
    },
  });

   const loadReports = useCallback(async () => {
    // In a real app, you would get the authenticated user's ID
    const userId = "user_creator_123";
    setIsFetching(true);
    const reports = await getReportsForUser(userId);
    setSubmittedReports(reports);
    setIsFetching(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const result = await submitManualReportAction(values);

    if (result.success) {
      toast({
        title: "Report Submitted",
        description: result.message,
      });
      form.reset();
      loadReports(); // Refresh the list
    } else {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: result.message,
        });
    }
    
    setIsLoading(false);
  }

  const getStatusVariant = (status: Report['status']) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'in_review':
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'in_review':
      default:
        return 'In Review';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Manual Report</CardTitle>
          <CardDescription>
            Found a copyright infringement not yet detected by our system? Report it here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the platform of the infringing content" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="web">Web Page</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="suspectUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suspect URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/infringing-content" {...field} />
                    </FormControl>
                    <FormDescription>The direct link to the content you are reporting.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Reporting</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly explain why this content is infringing on your copyright."
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Submitted Reports</CardTitle>
          <CardDescription>A log of your manually submitted reports and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="text-center py-10 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : submittedReports.length > 0 ? (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Suspect URL</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Submitted</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {submittedReports.map((report) => (
                    <TableRow key={report.id}>
                    <TableCell className="font-medium truncate max-w-xs">
                        <a href={report.suspectUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {report.suspectUrl}
                        </a>
                    </TableCell>
                    <TableCell className="capitalize">{report.platform}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(report.status)}>{getStatusText(report.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{new Date(report.submitted).toLocaleDateString()}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
                <p>You have not submitted any manual reports.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
