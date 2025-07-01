
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Clipboard, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Report, ProtectedContent, Violation } from "@/lib/types";
import { getReportsForUser } from "@/lib/reports-store";
import { submitManualReportAction } from './actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import jsPDF from 'jspdf';
import { getAllContentForUser } from "@/lib/content-store";
import { getViolationsForUser } from "@/lib/violations-store";

const formSchema = z.object({
  platform: z.string({ required_error: "Please select a platform." }).min(1, "Please select a platform."),
  suspectUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
});


export default function SubmitReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [submittedReports, setSubmittedReports] = useState<Report[]>([]);
  const { toast } = useToast();

  const [violations, setViolations] = useState<Violation[]>([]);
  const [protectedContent, setProtectedContent] = useState<ProtectedContent[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>("");
  const [selectedViolationId, setSelectedViolationId] = useState<string>("");
  const [dmcaTemplate, setDmcaTemplate] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        suspectUrl: "",
        reason: "",
    },
  });

   const loadData = useCallback(async () => {
    // In a real app, you would get the authenticated user's ID
    const userId = "user_creator_123";
    setIsFetching(true);
    try {
        const [reports, violationsData, contentData] = await Promise.all([
          getReportsForUser(userId),
          getViolationsForUser(userId),
          getAllContentForUser(userId),
        ]);
        setSubmittedReports(reports);
        setViolations(violationsData);
        setProtectedContent(contentData);
    } catch (error) {
        console.error("Failed to load dashboard data:", error)
        toast({
            variant: "destructive",
            title: "Failed to load data",
            description: "Could not fetch necessary data. Please try again later."
        })
    }
    setIsFetching(false);
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  useEffect(() => {
    const selectedContent = protectedContent.find(c => c.id === selectedContentId);
    const selectedViolation = violations.find(v => v.id === selectedViolationId);

    if (selectedContent && selectedViolation) {
      const template = `
DMCA Takedown Notice

To Whom It May Concern,

I am writing to notify you of a copyright infringement under the Digital Millennium Copyright Act (DMCA).

1. The copyrighted work at issue is my content titled "${selectedContent.title}", which is originally located at:
${selectedContent.videoURL}

2. The infringing material is located at the following URL:
${selectedViolation.matchedURL}

3. My contact information is as follows:
[YOUR FULL NAME]
[YOUR ADDRESS]
[YOUR PHONE NUMBER]
[YOUR EMAIL ADDRESS]

4. I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.

5. I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

Sincerely,
[YOUR FULL NAME]
      `.trim();
      setDmcaTemplate(template);
    } else {
      setDmcaTemplate('');
    }
  }, [selectedContentId, selectedViolationId, protectedContent, violations]);

  const handleExportPdf = () => {
    if (!dmcaTemplate) return;
    try {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(dmcaTemplate, 180);
      const selectedViolation = violations.find(v => v.id === selectedViolationId);
      doc.text(splitText, 15, 20);
      doc.save(`DMCA_Notice_${selectedViolation?.platform}_${Date.now()}.pdf`);
    } catch(e) {
      console.error("Failed to generate PDF:", e)
      toast({ variant: 'destructive', title: "PDF Export Failed", description: "There was an error creating the PDF."})
    }
  };

  const handleCopyToClipboard = () => {
    if (!dmcaTemplate) return;
    navigator.clipboard.writeText(dmcaTemplate).then(() => {
      toast({ title: "Copied to clipboard!" });
    }).catch(err => {
      toast({ variant: 'destructive', title: "Failed to copy text." });
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const result = await submitManualReportAction(values);

    if (result.success) {
      toast({
        title: "Report Submitted",
        description: result.message,
      });
      form.reset();
      loadData(); // Refresh the list
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
          <CardTitle>Legal Reporting Center</CardTitle>
          <CardDescription>Generate pre-filled DMCA takedown notices for detected violations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Select onValueChange={setSelectedContentId} value={selectedContentId}>
              <SelectTrigger>
                <SelectValue placeholder="1. Select Your Original Content" />
              </SelectTrigger>
              <SelectContent>
                {protectedContent.length > 0 ? protectedContent.map(content => (
                  <SelectItem key={content.id} value={content.id}>{content.title}</SelectItem>
                )) : <SelectItem value="none" disabled>No protected content found.</SelectItem>}
              </SelectContent>
            </Select>
             <Select onValueChange={setSelectedViolationId} value={selectedViolationId} disabled={!selectedContentId}>
              <SelectTrigger>
                <SelectValue placeholder="2. Select Infringing Content URL" />
              </SelectTrigger>
              <SelectContent>
                {violations.length > 0 ? violations.map(violation => (
                  <SelectItem key={violation.id} value={violation.id}>{violation.matchedURL}</SelectItem>
                )) : <SelectItem value="none" disabled>No violations found.</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <Textarea 
            value={dmcaTemplate} 
            readOnly 
            placeholder="Select your content and an infringing URL to generate a DMCA notice." 
            className="h-72 min-h-72 resize-none font-code text-xs"
          />
        </CardContent>
        <CardFooter className="gap-2 justify-end">
          <Button variant="outline" onClick={handleExportPdf} disabled={!dmcaTemplate}>
            <Download className="mr-2 h-4 w-4" /> Export as PDF
          </Button>
          <Button onClick={handleCopyToClipboard} disabled={!dmcaTemplate}>
            <Clipboard className="mr-2 h-4 w-4" /> Copy for YouTube
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>How-to Report Guides</CardTitle>
            <CardDescription>Simple steps for submitting claims on major platforms.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="youtube">
                    <AccordionTrigger>YouTube</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                        <p>1. Ensure you are signed into the correct YouTube account.</p>
                        <p>2. Navigate to YouTube's copyright submission form.</p>
                        <p>3. Use the "Copy for YouTube" button above to copy the DMCA notice text.</p>
                        <p>4. Paste the text into the appropriate fields in the form and submit.</p>
                        <Button variant="link" asChild className="p-0 h-auto">
                            <a href="https://www.youtube.com/copyright_complaint_form" target="_blank" rel="noopener noreferrer">
                                Go to YouTube Copyright Form <LinkIcon className="ml-1 h-4 w-4" />
                            </a>
                        </Button>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="instagram">
                    <AccordionTrigger>Instagram / Facebook</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                        <p>1. Go to Meta's copyright report form.</p>
                        <p>2. Select "Copyright" and continue.</p>
                        <p>3. Select "I am the rights owner".</p>
                        <p>4. Fill out the form. You can copy and paste details from the template above.</p>
                        <Button variant="link" asChild className="p-0 h-auto">
                           <a href="https://www.facebook.com/help/contact/1758255661104383" target="_blank" rel="noopener noreferrer">
                                Go to Meta Copyright Form <LinkIcon className="ml-1 h-4 w-4" />
                            </a>
                        </Button>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="generic">
                    <AccordionTrigger>Generic Website (via Hosting Provider)</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                        <p>1. Find the website's hosting provider using a tool like <a href="https://www.whoishostingthis.com/" target="_blank" rel="noopener noreferrer" className="underline">WhoIsHostingThis</a>.</p>
                        <p>2. Go to the hosting provider's website and find their "Contact Us" or "Abuse" page.</p>
                        <p>3. Export the DMCA notice above as a PDF and attach it to your email to their abuse/legal department.</p>
                        <p>4. Clearly state your issue in the email and reference the attached DMCA notice.</p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
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
