
'use client';

import { useState, useRef } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  email: z.string().email(),
});

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
    const [isLoading, setIsLoading] = useState(false);

    // State for profile settings
    const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/128x128.png");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form for profile information
    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            displayName: "Admin User",
            email: "admin@creatorshield.com",
        },
    });

    // Form for platform settings
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
    
    // --- Profile Handlers ---

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            toast({
                title: "Picture Updated",
                description: "Your new profile picture has been saved (simulated).",
            });
            setIsUploading(false);
        }, 1500);
    }

    function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
        console.log("Updating admin profile:", values);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
    }

    function onPasswordChangeClick() {
        toast({
            title: "Forgot Password",
            description: "In a real app, a password reset email would be sent.",
        });
    }

    // --- Platform Settings Handler ---

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
        
        <h2 className="text-xl font-semibold">My Profile</h2>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Update your profile picture.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={avatarUrl} alt="Admin Avatar" data-ai-hint="profile picture" />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                             <Input 
                                id="picture" 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg"
                            />
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Choose Picture</Button>
                            <Button onClick={handleUpload} disabled={avatarUrl.startsWith('https://placehold.co') || isUploading}>
                                {isUploading ? 'Uploading...' : 'Update Picture'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                            <FormField
                                control={profileForm.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Name" {...field} className="max-w-xs" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={profileForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} disabled className="max-w-xs" />
                                        </FormControl>
                                        <FormDescription>Your email address cannot be changed.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Update Profile</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Password</h3>
                            <p className="text-sm text-muted-foreground">Change your account password.</p>
                        </div>
                        <Button variant="outline" onClick={onPasswordChangeClick}>Change Password</Button>
                    </div>
                </CardContent>
            </Card>
        </div>


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
