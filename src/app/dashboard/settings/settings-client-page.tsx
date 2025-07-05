
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
import { useAuth } from "@/context/auth-context";
import { signInWithYouTube, signOut } from "@/lib/auth";
import { updateUserAction } from "./actions";

export default function SettingsClientPage() {
    const { toast } = useToast();
    const { user, loading, revalidateUser } = useAuth();
    const [isSaving, setIsSaving] = React.useState(false);
    const [profilePicture, setProfilePicture] = React.useState(user?.photoURL);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setProfilePicture(user?.photoURL);
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const displayName = formData.get('displayName') as string;

        try {
            await updateUserAction(user.uid, { displayName });
            await revalidateUser();
            toast({ title: "Profile Updated", description: "Your profile information has been saved." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Update Failed", description: "Could not update your profile." });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleConnect = async () => {
        try {
            await signInWithYouTube();
            await revalidateUser();
            toast({ title: 'YouTube Connected', description: 'Your channel analytics will be available shortly.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Connection Failed', description: 'Could not connect to YouTube. Please try again.' });
        }
    }

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
                            <AvatarFallback>{user?.displayName?.substring(0,2) ?? "C"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                           <Input id="picture" type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setProfilePicture(URL.createObjectURL(file));
                           }} accept="image/png, image/jpeg" />
                           <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Choose Picture</Button>
                           <p className="text-xs text-muted-foreground">Picture updates are not implemented.</p>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input id="displayName" name="displayName" defaultValue={user?.displayName ?? ""} className="max-w-sm" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user?.email ?? ""} disabled className="max-w-sm" />
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
                            {user?.youtubeChannelId ? (
                                <p className="text-sm text-muted-foreground">Connected: {user.displayName}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">Not connected</p>
                            )}
                        </div>
                    </div>
                     {user?.youtubeChannelId ? (
                        <Button variant="destructive" disabled>Disconnect</Button>
                     ) : (
                        <Button onClick={handleConnect}>Connect YouTube</Button>
                     )}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Sign Out</CardTitle>
                <CardDescription>Sign out of your CreatorShield account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}
