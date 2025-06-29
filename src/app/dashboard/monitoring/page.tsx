
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
import { Loader2, FileUp, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

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

export default function MonitoringPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const textForm = useForm<z.infer<typeof textFormSchema>>({
    resolver: zodResolver(textFormSchema),
    defaultValues: {
      url: "",
      creatorContent: "",
    },
  });

  const mediaForm = useForm<z.infer<typeof mediaFormSchema>>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      url: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        if (selectedFile.type.startsWith('image/')) {
            // Create a temporary URL for image preview
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            // For videos or other files, no preview is shown
            setPreview(null);
        }
    }
  };

  async function onTextSubmit(values: z.infer<typeof textFormSchema>) {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await monitorWebPagesForCopyrightInfringements({
          url: values.url,
          creatorContent: values.creatorContent
      });
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

  async function onMediaSubmit(values: z.infer<typeof mediaFormSchema>) {
    if (!file) {
        toast({ variant: "destructive", title: "No file selected", description: "Please upload an image or video file." });
        return;
    }
    setIsLoading(true);
    setReport(null);
    try {
        const dataUri = await fileToDataUri(file);
        const result = await monitorWebPagesForCopyrightInfringements({
            url: values.url,
            photoDataUri: dataUri
        });
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
                    <FormField
                        control={textForm.control}
                        name="url"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Web Page URL</FormLabel>
                            <FormControl>
                            <Input placeholder="https://example.com/page" {...field} />
                            </FormControl>
                            <FormDescription>The URL of the page you want to scan.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={textForm.control}
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
                            <FormDescription>Provide a representative sample of your work for comparison.</FormDescription>
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
            </TabsContent>

            <TabsContent value="media" className="mt-6">
                 <Form {...mediaForm}>
                    <form onSubmit={mediaForm.handleSubmit(onMediaSubmit)} className="space-y-8">
                    <FormField
                        control={mediaForm.control}
                        name="url"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Web Page URL</FormLabel>
                            <FormControl>
                            <Input placeholder="https://example.com/page-with-media" {...field} />
                            </FormControl>
                            <FormDescription>The URL of the page where you suspect your media is being used.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    
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
                                    <Image src={preview} alt="Image preview" width={100} height={100} className="rounded-md object-cover h-24 w-24" />
                                ) : (
                                    <div className="h-24 w-24 bg-muted rounded-md flex items-center justify-center">
                                        <VideoIcon className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold break-all">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Scan Page
                    </Button>
                    </form>
                </Form>
            </TabsContent>
           </Tabs>
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
