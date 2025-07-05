
'use client';

import * as React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ThemeSettings } from '@/components/settings/theme-settings';

const platformSettingsFormSchema = z.object({
  allowRegistrations: z.boolean().default(true),
  strikeThreshold: z.coerce.number().min(1).max(10),
  notificationEmail: z.string().email({ message: "Please enter a valid email." }),
  notifyOnStrikes: z.boolean().default(true),
  notifyOnReactivations: z.boolean().default(true),
  matchThreshold: z.array(z.number()).default([85]),
});


export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    
    const platformForm = useForm<z.infer<typeof platformSettingsFormSchema>>({
        resolver: zodResolver(platformSettingsFormSchema),
        defaultValues: {
            allowRegistrations: true,
            strikeThreshold: 3,
            notificationEmail: "admin-alerts@creatorshield.com",
            notifyOnStrikes: true,
            notifyOnReactivations: true,
            matchThreshold: [85],
        },
    });
    
    function onPlatformSubmit(data: z.infer<typeof platformSettingsFormSchema>) {
        setIsLoading(true);
        console.log("Simulating saving platform settings:", data);
        
        setTimeout(() => {
            toast({
                title: "Platform Settings Saved",
                description: "Your changes have been successfully saved.",
            });
            setIsLoading(false);
        }, 1500);
    }
  
  return (
    <div className="space-y-8">
       <div className="space-y-2">
            <h1 className="text-2xl font-bold">Admin Settings</h1>
            <p className="text-muted-foreground">
                Manage your personal account and platform-wide configurations.
            </p>
        </div>

        <Separator />
        
        <ThemeSettings />

        <Separator />

        <h2 className="text-xl font-semibold">Platform Settings</h2>

        <Form {...platformForm}>
            <form onSubmit={platformForm.handleSubmit(onPlatformSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Control core platform behaviors.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={platformForm.control}
                            name="allowRegistrations"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Allow New User Registrations</FormLabel>
                                    <FormDescription>
                                        Enable or disable the ability for new creators to sign up.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={platformForm.control}
                            name="strikeThreshold"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Strike Threshold</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="3" {...field} className="max-w-xs"/>
                                </FormControl>
                                <FormDescription>
                                    Number of copyright strikes a creator can receive before their account is suspended.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Configure where administrative alerts are sent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <FormField
                            control={platformForm.control}
                            name="notificationEmail"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Admin Notification Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="admin@example.com" {...field} className="max-w-xs" />
                                </FormControl>
                                <FormDescription>
                                    The email address that receives all admin notifications.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div>
                            <FormLabel>Receive alerts for:</FormLabel>
                            <div className="space-y-2 mt-2">
                                <FormField
                                    control={platformForm.control}
                                    name="notifyOnStrikes"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="font-normal">New Strike Requests</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={platformForm.control}
                                    name="notifyOnReactivations"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="font-normal">Reactivation Requests</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Content Monitoring</CardTitle>
                        <CardDescription>Adjust the sensitivity of the AI-powered content analysis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={platformForm.control}
                            name="matchThreshold"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Match Score Threshold: {field.value?.[0]}%</FormLabel>
                                <FormControl>
                                    <Slider
                                        min={50}
                                        max={100}
                                        step={1}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Content will be flagged as a potential violation if the match score is above this value.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-start">
                    <Button type="submit" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Platform Changes
                    </Button>
                </div>
            </form>
        </Form>
    </div>
  )
}
