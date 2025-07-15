
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
import { useSession } from "next-auth/react";

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

function getUserEmail(session: any) {
  let email = session?.user?.email;
  if (!email && typeof window !== "undefined") {
    const token = localStorage.getItem("creator_jwt");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        email = decoded.email;
      } catch {}
    }
  }
  return email;
}

export function MonitoringClient({ initialHistory, defaultUrl = '', defaultTitle = '', defaultPublishedAt = '' }: { initialHistory: WebScan[], defaultUrl?: string, defaultTitle?: string, defaultPublishedAt?: string }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [report, setReport] = React.useState<MonitorWebPagesOutput | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [creatorContent, setCreatorContent] = React.useState<string | { url: string; type: 'audio' | 'video' } | null>(null);
  const [scanHistory, setScanHistory] = React.useState<WebScan[]>(initialHistory);
  const [historyFilter, setHistoryFilter] = React.useState<{ type: string, status: string }>({ type: 'all', status: 'all' });
  // Add state for audioUrl and videoUrl
  const [audioUrl, setAudioUrl] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  const { data: session } = useSession();


  const { toast } = useToast();

  // 1. Remove TabsTrigger and TabsContent for 'text' and 'media' (image)
  // 2. Remove textForm, mediaForm, onTextSubmit, onMediaSubmit, and related state/logic
  // 3. Only keep audio and video tabs, forms, and logic
  // 4. Update scan history filter to only show audio and video types

  const audioForm = useForm<z.infer<typeof mediaFormSchema>>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: { url: defaultUrl },
  });
  
  // Update handleFileChange to preview audio and video
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        if (selectedFile.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(selectedFile));
        } else if (selectedFile.type.startsWith('audio/')) {
            setPreview(URL.createObjectURL(selectedFile));
        } else if (selectedFile.type.startsWith('video/')) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    }
  };

  const refreshHistory = React.useCallback(async () => {
    if (session?.user?.email) {
      const res = await fetch(`/api/creator-by-email?email=${session.user.email}`);
      const user = await res.json();
      if (user?.id) {
        const history = await getScansForUser(user.id);
        setScanHistory(history);
      }
    }
  }, [session]);


  async function onAudioSubmit(values: z.infer<typeof mediaFormSchema>) {
    if (!file) {
      toast({ variant: "destructive", title: "No file selected" });
      return;
    }
    setIsLoading(true);
    setReport(null);
    const email = getUserEmail(session);
    if (!email) {
      toast({ variant: "destructive", title: "Not logged in" });
      setIsLoading(false);
      return;
    }
    const res = await fetch(`/api/creator-by-email?email=${email}`);
    const user = await res.json();
    if (!user?.id) {
      toast({ variant: "destructive", title: "User not found" });
      setIsLoading(false);
      return;
    }
    const dataUri = await fileToDataUri(file);
    setCreatorContent({ url: dataUri, type: file.type.startsWith('audio') ? 'audio' : 'video'});
    const result = await scanPageAction({ url: values.url, photoDataUri: dataUri });
    handleActionResult(result);
    setIsLoading(false);
  }
  async function onVideoSubmit(values: z.infer<typeof mediaFormSchema>) {
    if (!file) {
      toast({ variant: "destructive", title: "No file selected" });
      return;
    }
    setIsLoading(true);
    setReport(null);
    const email = getUserEmail(session);
    if (!email) {
      toast({ variant: "destructive", title: "Not logged in" });
      setIsLoading(false);
      return;
    }
    const res = await fetch(`/api/creator-by-email?email=${email}`);
    const user = await res.json();
    if (!user?.id) {
      toast({ variant: "destructive", title: "User not found" });
      setIsLoading(false);
      return;
    }
    const dataUri = await fileToDataUri(file);
    setCreatorContent({ url: dataUri, type: 'video' });
    const result = await scanPageAction({ url: values.url, videoDataUri: dataUri });
    handleActionResult(result);
    setIsLoading(false);
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
           <Tabs defaultValue="audio" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="audio">Scan with Audio</TabsTrigger>
                <TabsTrigger value="video">Scan with Video</TabsTrigger>
            </TabsList>

            <TabsContent value="audio" className="mt-6">
                 <Form {...audioForm}>
                    <form onSubmit={audioForm.handleSubmit(onAudioSubmit)} className="space-y-8">
                        <FormField control={audioForm.control} name="url" render={({ field }) => (<FormItem><FormLabel>Web Page URL</FormLabel><FormControl><Input placeholder="https://example.com/page-with-audio" {...field} /></FormControl><FormDescription>The URL of the page where you suspect your audio is being used.</FormDescription><FormMessage /></FormItem>)} />
                        <FormItem>
                            <FormLabel>Your Audio File</FormLabel>
                            <FormControl>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="audio-dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">MP3, WAV, etc.</p>
                                        </div>
                                        <Input id="audio-dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="audio/*" />
                                    </label>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        {file && (
                        <div className="p-4 border rounded-md bg-muted/50">
                            <h4 className="font-medium mb-2">Selected File:</h4>
                            <div className="flex items-center gap-4">
                                <audio controls src={preview || undefined} className="h-10" />
                                <div><p className="text-sm font-semibold break-all">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                            </div>
                        </div>)}

                        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Scan Page</Button>
                    </form>
                </Form>
            </TabsContent>

            <TabsContent value="video" className="mt-6">
                 <Form {...audioForm}>
                    <form onSubmit={audioForm.handleSubmit(onVideoSubmit)} className="space-y-8">
                        <FormField control={audioForm.control} name="url" render={({ field }) => (<FormItem><FormLabel>Web Page URL</FormLabel><FormControl><Input placeholder="https://example.com/page-with-video" {...field} /></FormControl><FormDescription>The URL of the page where you suspect your video is being used.</FormDescription><FormMessage /></FormItem>)} />
                        <FormItem>
                            <FormLabel>Your Video File</FormLabel>
                            <FormControl>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="video-dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">MP4, MOV, etc.</p>
                                        </div>
                                        <Input id="video-dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="video/*" />
                                    </label>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        {file && (
                        <div className="p-4 border rounded-md bg-muted/50">
                            <h4 className="font-medium mb-2">Selected File:</h4>
                            <div className="flex items-center gap-4">
                                <video controls src={preview || undefined} className="h-24 w-24 rounded-md object-cover" />
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
                                    {creatorContent && typeof creatorContent === 'object' && creatorContent.type === 'audio' ? (
                                        <audio controls src={creatorContent.url} />
                                    ) : creatorContent && typeof creatorContent === 'object' && creatorContent.type === 'video' ? (
                                        <video controls src={creatorContent?.url} />
                                    ) : creatorContent ? (
                                        <p className="text-sm text-muted-foreground italic">&quot;{typeof creatorContent === 'object' ? creatorContent.url : creatorContent}&quot;</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No content available.</p>
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
                      <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="audio">Audio</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent>
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
