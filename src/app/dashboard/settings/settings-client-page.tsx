
'use client';

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ThemeSettings } from "@/components/settings/theme-settings";
import { LogOut, Youtube, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';

export default function SettingsClientPage() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = React.useState(false);
    
    // Mock data for display
    const mockUser = {
        displayName: 'Sample Creator',
        email: 'creator@example.com',
        photoURL: 'https://placehold.co/128x128.png',
    };

    const [displayName, setDisplayName] = React.useState(mockUser.displayName);
    const [profilePicture, setProfilePicture] = React.useState(mockUser.photoURL);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({ title: "Profile Updated", description: "Your display name has been saved." });
        setIsSaving(false);
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
                <form className="space-y-6" onSubmit={handleProfileUpdate}>
                    <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={profilePicture ?? undefined} data-ai-hint="profile picture" />
                            <AvatarFallback>{displayName?.substring(0,2) ?? "C"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                           <Input id="picture" type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setProfilePicture(URL.createObjectURL(file));
                           }} accept="image/png, image/jpeg" />
                           <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Choose Picture</Button>
                           <p className="text-xs text-muted-foreground">Picture updates are not implemented in this demo.</p>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input id="displayName" name="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} className="max-w-sm" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={mockUser.email} disabled className="max-w-sm" />
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
                <CardDescription>Connect your YouTube account to fetch analytics and monitor content.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <Youtube className="w-8 h-8 text-red-600" />
                        <div>
                            <h3 className="font-semibold">YouTube</h3>
                            <p className="text-sm text-muted-foreground">Not connected</p>
                        </div>
                    </div>
                     <Button variant="outline" onClick={() => toast({ title: "Authentication Removed", description: "The login system has been removed from this app."})}>Connect YouTube</Button>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
