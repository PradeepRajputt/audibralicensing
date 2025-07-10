
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
import * as React from "react";
import { Loader2, FileUp, Image as ImageIcon, Video as VideoIcon, Send, ShieldOff, FileWarning } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MonitorWebPagesOutput } from "@/ai/flows/monitor-web-pages";
import type { WebScan } from "@/lib/types";
import { scanPageAction } from "./actions";
import { getScansForUser } from "@/lib/web-scans-store";

// Schema for the text-based scan
const textFormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  creatorContent: z.string().min(50, {
    message: "Please provide at least 50 characters of your content.",
  }),
});

// Schema for the media-based scan
const mediaFormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function MonitoringClient({ initialHistory, defaultUrl = '', defaultTitle = '', defaultPublishedAt = '' }: { initialHistory: WebScan[], defaultUrl?: string, defaultTitle?: string, defaultPublishedAt?: string }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [report, setReport] = React.useState<MonitorWebPagesOutput | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [creatorContent, setCreatorContent] = React.useState<string | { url: string; type: 'image' | 'video' } | null>(null);
  const [scanHistory, setScanHistory] = React.useState<WebScan[]>(initialHistory);
  const [historyFilter, setHistoryFilter] = React.useState<{ type: string, status: string }>({ type: 'all', status: 'all' });

  const { toast } = useToast();

  const textForm = useForm<z.infer<typeof textFormSchema>>({
    resolver: zodResolver(textFormSchema),
    defaultValues: { url: defaultUrl, creatorContent: defaultTitle ? `${defaultTitle} (Uploaded: ${defaultPublishedAt})` : '' },
  });

  const mediaForm = useForm<z.infer<typeof mediaFormSchema>>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: { url: defaultUrl },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        if (selectedFile.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    }
  };

  const refreshHistory = React.useCallback(async () => {
    const userId = "user_creator_123";
    const history = await getScansForUser(userId);
    setScanHistory(history);
  }, []);


  async function onTextSubmit(values: z.infer<typeof textFormSchema>) {
    setIsLoading(true);
    setReport(null);
    setCreatorContent(values.creatorContent);
    const result = await scanPageAction(values);
    handleActionResult(result);
  }

  async function onMediaSubmit(values: z.infer<typeof mediaFormSchema>) {
    if (!file) {
        toast({ variant: "destructive", title: "No file selected" });
        return;
    }
    setIsLoading(true);
    setReport(null);

    const dataUri = await fileToDataUri(file);
    setCreatorContent({ url: dataUri, type: file.type.startsWith('image') ? 'image' : 'video'});

    const result = await scanPageAction({ url: values.url, photoDataUri: dataUri });
    handleActionResult(result);
  }
  
  const handleActionResult = (result: { success: boolean; data?: MonitorWebPagesOutput; message?: string }) => {
    if (result.success && result.data) {
        setReport(result.data);
    } else {
        toast({
            variant: "destructive",
            title: "An error occurred",
            description: result.message || "Failed to scan the web page. Please try again.",
        });
    }
    setIsLoading(false);
    refreshHistory();
  };
  
  const filteredHistory = React.useMemo(() => {
    return scanHistory.filter(scan => 
        (historyFilter.type === 'all' || scan.scanType === historyFilter.type) &&
        (historyFilter.status === 'all' || (historyFilter.status === 'found' && scan.matchFound) || (historyFilter.status === 'not_found' && !scan.matchFound))
    );
  }, [scanHistory, historyFilter]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monitor a Web Page</CardTitle>
          <CardDescription>
            Scan a web page for potential copyright infringements using your text, image, or video content.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Scan with Text</TabsTrigger>
                <TabsTrigger value="media">Scan with Image/Video</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-6">
                 <Form {...textForm}>
                    <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-8">
                        <FormField control={textForm.control} name="url" render={({ field }) => (<FormItem><FormLabel>Web Page URL</FormLabel><FormControl><Input placeholder="https://example.com/page" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={textForm.control} name="creatorContent" render={({ field }) => (<FormItem><FormLabel>Your Content</FormLabel><FormControl><Textarea placeholder="Paste a sample of your original text content here..." className="resize-y min-h-[150px]" {...field} /></FormControl><FormDescription>Provide a representative sample of your work for comparison.</FormDescription><FormMessage /></FormItem>)} />
                        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Scan Page</Button>
                    </form>
                </Form>
            </TabsContent>

            <TabsContent value="media" className="mt-6">
                 <Form {...mediaForm}>
                    <form onSubmit={mediaForm.handleSubmit(onMediaSubmit)} className="space-y-8">
                        <FormField control={mediaForm.control} name="url" render={({ field }) => (<FormItem><FormLabel>Web Page URL</FormLabel><FormControl><Input placeholder="https://example.com/page-with-media" {...field} /></FormControl><FormDescription>The URL of the page where you suspect your media is being used.</FormDescription><FormMessage /></FormItem>)} />
                        <FormItem>
                            <FormLabel>Your Image or Video File</FormLabel>
                            <FormControl>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, MP4, MOV, etc.</p>
                                        </div>
                                        <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*"/>
                                    </label>
                                </div> 
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        {file && (
                        <div className="p-4 border rounded-md bg-muted/50">
                            <h4 className="font-medium mb-2">Selected File:</h4>
                            <div className="flex items-center gap-4">
                                {preview ? (
                                    <Image src={preview} alt="Image preview" width={100} height={100} className="rounded-md object-cover h-24 w-24" data-ai-hint="file preview" />
                                ) : (
                                    <div className="h-24 w-24 bg-muted rounded-md flex items-center justify-center">
                                        <VideoIcon className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                )}
                                <div><p className="text-sm font-semibold break-all">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                            </div>
                        </div>)}

                        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Scan Page</Button>
                    </form>
                </Form>
            </TabsContent>
           </Tabs>
        </CardContent>
      </Card>
      
      {isLoading && ( <Card><CardContent className="pt-6 flex items-center justify-center"><div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /><p>Scanning page... This may take a moment.</p></div></CardContent></Card> )}
      
      {report && (
        <Card>
            <CardHeader><CardTitle>Scan Result</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {report.matchFound ? (
                    <>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Your Content</CardTitle></CardHeader>
                                <CardContent>
                                    {typeof creatorContent === 'string' ? (
                                        <p className="text-sm text-muted-foreground italic">&quot;{creatorContent.slice(0, 200)}...&quot;</p>
                                    ) : creatorContent?.type === 'image' ? (
                                        <Image src={creatorContent.url} alt="Creator content" width={300} height={200} className="rounded-md" data-ai-hint="uploaded photo" />
                                    ) : (
                                        <div className="h-48 w-full bg-muted rounded-md flex items-center justify-center"><VideoIcon className="w-16 h-16 text-muted-foreground" /></div>
                                    )}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle>Found on Page</CardTitle></CardHeader>
                                <CardContent>
                                    {typeof creatorContent === 'string' ? (
                                        <p className="text-sm text-muted-foreground italic">&quot;{report.matchedContentSnippet}&quot;</p>
                                    ) : (
                                        <Image src={report.matchedContentSnippet!} alt="Matched content on page" width={300} height={200} className="rounded-md" data-ai-hint="webpage content" />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-2">
                             <Label>Confidence Score: {Math.round(report.confidenceScore * 100)}%</Label>
                             <TooltipProvider><Tooltip><TooltipTrigger asChild>
                                <Progress value={report.confidenceScore * 100} className="w-full" />
                             </TooltipTrigger><TooltipContent>
                                <p>Based on AI analysis (cosine similarity for text, hash comparison for media).</p>
                             </TooltipContent></Tooltip></TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.infringementReport}</p>
                        <div className="flex gap-2 justify-end border-t pt-4">
                            <Button variant="outline" onClick={() => setReport(null)}><ShieldOff className="mr-2 h-4 w-4" />Mark as False Positive</Button>
                            <Button variant="secondary" onClick={() => toast({title: "Coming Soon!", description: "Automated warning emails will be available in a future update."})}><Send className="mr-2 h-4 w-4" />Send Warning Email</Button>
                            <Button onClick={() => toast({title: "Coming Soon!", description: "DMCA report generation is being improved."})}><FileWarning className="mr-2 h-4 w-4" />Generate DMCA Report</Button>
                        </div>
                    </>
                ) : (
                   <div className="text-center py-10 text-muted-foreground">
                        <p>{report.infringementReport}</p>
                    </div>
                )}
            </CardContent>
        </Card>
      )}

      <Card>
          <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>Your last 10 scan attempts.</CardDescription>
              <div className="flex items-center gap-2 pt-2">
                  <Select value={historyFilter.type} onValueChange={(value) => setHistoryFilter(f => ({ ...f, type: value }))}>
                      <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by type..." /></SelectTrigger>
                      <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="text">Text</SelectItem><SelectItem value="image">Image/Video</SelectItem></SelectContent>
                  </Select>
                  <Select value={historyFilter.status} onValueChange={(value) => setHistoryFilter(f => ({ ...f, status: value }))}>
                      <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status..." /></SelectTrigger>
                      <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="found">Match Found</SelectItem><SelectItem value="not_found">No Match</SelectItem></SelectContent>
                  </Select>
              </div>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow><TableHead>Page URL</TableHead><TableHead>Type</TableHead><TableHead>Match Found</TableHead><TableHead className="text-right">Date</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredHistory.length > 0 ? filteredHistory.map(scan => (
                          <TableRow key={scan.id}>
                              <TableCell className="font-mono text-xs truncate max-w-sm"><a href={scan.pageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{scan.pageUrl}</a></TableCell>
                              <TableCell className="capitalize">{scan.scanType}</TableCell>
                              <TableCell><Badge variant={scan.matchFound ? 'destructive' : 'secondary'}>{scan.matchFound ? 'Yes' : 'No'}</Badge></TableCell>
                              <TableCell className="text-right text-muted-foreground text-xs">{new Date(scan.timestamp).toLocaleString()}</TableCell>
                          </TableRow>
                      )) : (
                          <TableRow><TableCell colSpan={4} className="h-24 text-center">No scan history found for the selected filters.</TableCell></TableRow>
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}
