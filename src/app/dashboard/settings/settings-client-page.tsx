
'use client';

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Youtube } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function SettingsClientPage() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = React.useState(false);
    const [profilePicture, setProfilePicture] = React.useState("https://placehold.co/128x128.png");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Mock user data - in a real app this would come from a hook or context
    const user = {
        name: 'Sample Creator',
        email: 'creator@example.com',
        image: 'https://placehold.co/128x128.png',
        youtubeChannelId: 'UC-mock-channel-id'
    };

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
                Manage your profile, connected accounts, and application settings.
            </p>
        </div>
         <Separator />
         <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                 <CardDescription>This is how your profile appears on the platform.</CardDescription>
            </CardHeader>
             <CardContent>
                <form className="space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    setIsSaving(true);
                    setTimeout(() => {
                        toast({title: "Profile Updated", description: "Your profile information has been saved."});
                        setIsSaving(false);
                    }, 1500)
                }}>
                    <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={profilePicture} data-ai-hint="profile picture" />
                            <AvatarFallback>{user?.name?.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                           <Input id="picture" type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setProfilePicture(URL.createObjectURL(file));
                           }} accept="image/png, image/jpeg" />
                           <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Choose Picture</Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input id="displayName" defaultValue={user.name ?? ""} className="max-w-sm" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user.email ?? ""} disabled className="max-w-sm" />
                    </div>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>

        <ThemeSettings />

        <Card>
            <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
                <CardDescription>Manage your connected account to fetch analytics and monitor content.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <Youtube className="w-8 h-8 text-red-600" />
                        <div>
                            <h3 className="font-semibold">YouTube</h3>
                            {user.youtubeChannelId ? (
                                <p className="text-sm text-muted-foreground">Connected as: {user.name}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">Not connected</p>
                            )}
                        </div>
                    </div>
                     <Button variant="destructive" disabled>Disconnect</Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Sign Out</CardTitle>
                <CardDescription>Sign out of your CreatorShield account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}
