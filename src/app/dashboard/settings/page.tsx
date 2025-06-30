'use client'

import * as React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Youtube } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useSession, signIn, signOut } from "next-auth/react"

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const { toast } = useToast();

    // The user's profile info comes directly from the session
    const user = session?.user;

    const handleConnect = () => {
        // This will initiate the Google sign-in flow and redirect to the dashboard.
        signIn('google', { callbackUrl: '/dashboard/settings' });
    }

    const handleDisconnect = () => {
        // This will sign the user out
        signOut({ callbackUrl: '/' });
    }

    const onProfileSubmit = () => {
        toast({
            title: "Profile Updated",
            description: "In a real app, this would save your display name.",
        });
    }

    if (status === 'loading') {
        return <div>Loading...</div>; // Or a skeleton loader
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your profile is managed through your connected Google account.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={user?.image ?? ''} alt="User Avatar" data-ai-hint="profile picture" />
                            <AvatarFallback>{user?.name?.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <Input defaultValue={user?.name ?? ''} className="max-w-xs" />
                            <Input value={user?.email ?? 'No email available'} disabled className="max-w-xs" />
                             <Button onClick={onProfileSubmit}>Update Profile</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Connected Platforms</CardTitle>
                    <CardDescription>Manage your connected account to fetch analytics and monitor content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                            <Youtube className="w-8 h-8 text-red-600" />
                            <div>
                                <h3 className="font-semibold">YouTube</h3>
                                {user?.youtubeChannelId ? (
                                    <p className="text-sm text-muted-foreground">
                                        Connected as: {user.name} ({user.youtubeChannelId})
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Not connected
                                    </p>
                                )}
                            </div>
                        </div>
                        {session ? (
                            <Button variant="destructive" onClick={handleDisconnect}>Disconnect</Button>
                        ) : (
                            <Button onClick={handleConnect}>Connect</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your account security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Account Access</h3>
                            <p className="text-sm text-muted-foreground">Sign out from all devices.</p>
                        </div>
                        <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</Button>
                    </div>
                    <Separator />
                     <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Delete Account</h3>
                            <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                        </div>
                        <Button variant="destructive">Delete Account</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
