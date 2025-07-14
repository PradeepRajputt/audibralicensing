
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
import { UserPlus, Bell, ShieldAlert, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ThemeSettings } from '@/components/settings/theme-settings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { useAdminProfile } from '../profile-context';
// Remove: import { getAdminProfile } from '@/lib/admin-stats';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';


const platformSettingsFormSchema = z.object({
  allowRegistrations: z.boolean().default(true),
  strikeThreshold: z.coerce.number().min(1).max(10),
  notificationEmail: z.string().email({ message: "Please enter a valid email." }),
  notifyOnStrikes: z.boolean().default(true),
  notifyOnReactivations: z.boolean().default(true),
  matchThreshold: z.array(z.number()).default([85]),
});

// Since auth is removed, we'll use a mock admin user for display
const mockAdminUser = {
    displayName: "Admin User",
    email: "admin@creatorshield.com",
    avatar: "https://placehold.co/128x128.png",
};


export default function AdminSettingsPage() {
    const { profile, setProfile } = useAdminProfile();
    const { toast } = useToast();
    const [isSavingPlatform, setIsSavingPlatform] = React.useState(false);
    const [isSavingProfile, setIsSavingProfile] = React.useState(false);
    const [profilePicture, setProfilePicture] = React.useState(profile.avatar);
    const [adminEmail, setAdminEmail] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);
    const [newPassword, setNewPassword] = React.useState('');
    const [isChangingPassword, setIsChangingPassword] = React.useState(false);

    React.useEffect(() => {
        async function fetchAdminProfile() {
            try {
                const res = await fetch('/api/settings/admin-profile');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setAdminEmail(data.email || '');
                if (data.avatar) setProfilePicture(data.avatar);
            } catch (err) {
                setAdminEmail('');
            }
        }
        fetchAdminProfile();
    }, []);

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
        setIsSavingPlatform(true);
        console.log("Simulating saving platform settings:", data);
        
        setTimeout(() => {
            toast({
                title: "Platform Settings Saved",
                description: "Your changes have been successfully saved.",
            });
            setIsSavingPlatform(false);
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
                            <AvatarImage src={profilePicture} data-ai-hint="profile picture" />
                            <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                           <Input id="picture" type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setProfilePicture(URL.createObjectURL(file));
                           }} accept="image/png, image/jpeg" />
                           <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Choose Picture</Button>
                           <Button onClick={async () => {
                                setIsSavingProfile(true);
                                try {
                                    // Convert file to base64
                                    const file = fileInputRef.current?.files?.[0];
                                    let avatarDataUrl = profilePicture;
                                    if (file) {
                                        avatarDataUrl = await new Promise<string>((resolve, reject) => {
                                            const reader = new FileReader();
                                            reader.onload = () => resolve(reader.result as string);
                                            reader.onerror = reject;
                                            reader.readAsDataURL(file);
                                        });
                                    }
                                    const res = await fetch('/api/settings/admin-profile', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ avatar: avatarDataUrl, email: adminEmail }),
                                    });
                                    if (!res.ok) throw new Error('Failed to update');
                                    setProfile({ ...profile, avatar: avatarDataUrl });
                                    setProfilePicture(avatarDataUrl);
                                    toast({title: "Picture Updated", description: "Your new profile picture has been saved."});
                                } catch (err) {
                                    toast({title: "Error", description: "Failed to update profile picture."});
                                }
                                setIsSavingProfile(false);
                           }} disabled={profilePicture === profile.avatar || isSavingProfile}>
                               {isSavingProfile ? "Uploading..." : "Update Picture"}
                           </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input value={profile.displayName} onChange={e => setProfile({ ...profile, displayName: e.target.value })} className="max-w-xs" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={adminEmail} disabled className="max-w-xs" />
                             <p className="text-sm text-muted-foreground">Your email address cannot be changed.</p>
                        </div>
                        <Button onClick={(e) => {
                           e.preventDefault();
                           toast({title: "Profile Updated", description: "Your profile information has been saved."})
                        }}>Update Profile</Button>
                    </form>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                       <div>
                            <h3 className="font-medium">Password</h3>
                            <p className="text-sm text-muted-foreground">Change your account password.</p>
                       </div>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                            Change Password
                        </Button>
                    </div>
                </CardContent>
            </Card>
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
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/40">
                                  <div className="flex items-center gap-3">
                                    <UserPlus className="w-6 h-6 text-primary" />
                                    <div>
                                      <FormLabel className="text-base font-semibold">Allow New User Registrations</FormLabel>
                                      <FormDescription>
                                        Enable or disable the ability for new creators to sign up.
                                      </FormDescription>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${field.value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{field.value ? 'Enabled' : 'Disabled'}</span>
                                    <FormControl>
                                      <div className="relative">
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={async (checked) => {
                                            field.onChange(checked);
                                            setIsSavingPlatform(true);
                                            await onPlatformSubmit({ ...platformForm.getValues(), allowRegistrations: checked });
                                            setIsSavingPlatform(false);
                                            toast({ title: "Setting Updated", description: `Registrations are now ${checked ? "enabled" : "disabled"}.` });
                                          }}
                                          disabled={isSavingPlatform}
                                        />
                                        {isSavingPlatform && (
                                          <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                                        )}
                                      </div>
                                    </FormControl>
                                  </div>
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
                          <FormLabel className="font-semibold flex items-center gap-2 mb-1"><Bell className="w-5 h-5 text-primary" /> Receive Alerts For</FormLabel>
                          <div className="space-y-2 mt-2 bg-muted/40 rounded-lg p-3">
                            <FormField
                              control={platformForm.control}
                              name="notifyOnStrikes"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-3 p-2 rounded-lg border border-gray-200 transition-colors">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <ShieldAlert className="w-5 h-5 text-yellow-600" />
                                  <FormLabel className="font-normal">New Strike Requests</FormLabel>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={platformForm.control}
                              name="notifyOnReactivations"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-3 p-2 rounded-lg border border-gray-200 transition-colors">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <RefreshCw className="w-5 h-5 text-blue-600" />
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
                        <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-primary" /> Content Monitoring System</CardTitle>
                        <CardDescription>Adjust the sensitivity of the AI-powered content analysis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={platformForm.control}
                            name="matchThreshold"
                            render={({ field }) => (
                                <FormItem>
                                <div className="flex items-center gap-3 mb-2">
                                  <FormLabel className="font-semibold">Match Score Threshold</FormLabel>
                                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">{field.value?.[0]}%</span>
                                </div>
                                 <FormControl>
                                    <Slider
                                      min={50}
                                      max={100}
                                      step={1}
                                      defaultValue={field.value}
                                      onValueChange={field.onChange}
                                      className="[&>.range-slider__track]:bg-blue-200 [&>.range-slider__thumb]:bg-blue-600"
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
                    <Button type="submit" disabled={isSavingPlatform}>
                         {isSavingPlatform && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Platform Changes
                    </Button>
                </div>
            </form>
        </Form>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Change Password</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        disabled={isChangingPassword}
      />
    </div>
    <DialogFooter>
      <Button
        onClick={async () => {
          setIsChangingPassword(true);
          try {
            const res = await fetch('/api/settings/admin-profile/password', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: adminEmail, password: newPassword }),
            });
            if (!res.ok) throw new Error('Failed to update password');
            toast({ title: 'Password Changed', description: 'Your password has been updated.' });
            setShowPasswordDialog(false);
            setNewPassword('');
          } catch (err) {
            toast({ title: 'Error', description: 'Failed to update password.' });
          }
          setIsChangingPassword(false);
        }}
        disabled={!newPassword || isChangingPassword}
      >
        {isChangingPassword ? 'Saving...' : 'Save Password'}
      </Button>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  )
}
