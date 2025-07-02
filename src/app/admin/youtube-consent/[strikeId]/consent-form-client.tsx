
'use client';

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { submitTakedownToYouTubeAction } from './actions';
import type { Report, User } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const takedownFormSchema = z.object({
  copyrightOwner: z.string().min(1, "Copyright holder name is required."),
  authority: z.string().min(1, "You must confirm your authority."),
  legalFullName: z.string().min(1, "Full legal name is required for signature."),
  address: z.string().min(10, "A valid physical address is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  email: z.string().email("A valid email address is required."),
  confirmGoodFaith: z.boolean().refine(val => val === true, { message: "You must agree to this statement." }),
  confirmAccuracy: z.boolean().refine(val => val === true, { message: "You must agree to this statement." }),
  confirmPenaltyOfPerjury: z.boolean().refine(val => val === true, { message: "You must agree to this statement." }),
  confirmAbuse: z.boolean().refine(val => val === true, { message: "You must agree to this statement." }),
});

export default function ConsentFormClient({ report, creator }: { report: Report, creator: User }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof takedownFormSchema>>({
    resolver: zodResolver(takedownFormSchema),
    defaultValues: {
      copyrightOwner: creator.legalFullName || creator.displayName || "",
      authority: "I am the owner, or an agent authorized to act on the owner’s behalf.",
      legalFullName: "",
      address: creator.address || "",
      phone: creator.phone || "",
      email: creator.email || "",
      confirmGoodFaith: false,
      confirmAccuracy: false,
      confirmPenaltyOfPerjury: false,
      confirmAbuse: false
    },
  });

  async function onSubmit(values: z.infer<typeof takedownFormSchema>) {
    setIsLoading(true);
    const result = await submitTakedownToYouTubeAction(report.id, { ...report, ...values });
    
    if(result.success) {
      toast({
        title: "Takedown Notice Submitted",
        description: "The request has been sent to YouTube and the report status has been updated.",
      });
    } else {
       toast({
        variant: 'destructive',
        title: "Submission Failed",
        description: result.message,
      });
    }
    
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div className="space-y-1">
              <h1 className="text-2xl font-bold">YouTube Copyright Takedown Notice</h1>
              <p className="text-muted-foreground">Final review before submitting a formal takedown request to YouTube.</p>
          </div>
          <Button asChild variant="outline">
              <Link href={`/admin/strikes/${report.id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Details
              </Link>
          </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Infringing URL:</span>
                <a href={report.suspectUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-primary hover:underline truncate max-w-md">{report.suspectUrl}</a>
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Content:</span>
                <a href={report.originalContentUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-primary hover:underline truncate max-w-md">{report.originalContentTitle}</a>
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Creator:</span>
                <span>{report.creatorName}</span>
            </div>
        </CardContent>
      </Card>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Copyright Owner Information</CardTitle>
                    <CardDescription>This information will be sent to YouTube as part of the legal notice.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-6">
                    <FormField control={form.control} name="copyrightOwner" render={({ field }) => (<FormItem><FormLabel>Copyright owner name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="authority" render={({ field }) => (<FormItem><FormLabel>Your authority to make this complaint</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Full physical address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Primary email address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                 </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Legal Agreements</CardTitle>
                    <CardDescription>You must agree to the following statements before submitting.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-6">
                    <FormField control={form.control} name="confirmGoodFaith" render={({ field }) => (<FormItem className="flex items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Good faith belief</FormLabel><FormDescription>I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</FormDescription></div></FormItem>)} />
                    <FormField control={form.control} name="confirmAccuracy" render={({ field }) => (<FormItem className="flex items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Information accuracy</FormLabel><FormDescription>The information in this notification is accurate.</FormDescription></div></FormItem>)} />
                    <FormField control={form.control} name="confirmPenaltyOfPerjury" render={({ field }) => (<FormItem className="flex items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Penalty of perjury</FormLabel><FormDescription>I swear, under penalty of perjury, that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</FormDescription></div></FormItem>)} />
                     <FormField control={form.control} name="confirmAbuse" render={({ field }) => (<FormItem className="flex items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Acknowledge abuse policy</FormLabel><FormDescription>I acknowledge that misuse of this tool, such as submitting fraudulent takedown requests, may result in the suspension of my account.</FormDescription></div></FormItem>)} />
                     <Separator />
                    <FormField control={form.control} name="legalFullName" render={({ field }) => (<FormItem><FormLabel>Signature (Full Legal Name)</FormLabel><FormControl><Input placeholder="Enter your full legal name" {...field} /></FormControl><FormDescription>Typing your full name here acts as your digital signature.</FormDescription><FormMessage /></FormItem>)} />
                 </CardContent>
                 <CardFooter>
                    <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Takedown Notice to YouTube</Button>
                 </CardFooter>
            </Card>
        </form>
      </Form>
    </div>
  );
}

