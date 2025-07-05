
'use client';

import * as React from "react";
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Youtube, Loader2, Trash2, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/auth-context";
import { useRouter } from 'next/navigation';
import { updateUser } from "@/lib/users-store";
import { upsertUser } from "@/lib/auth-actions";

export default function SettingsClientPage() {
    const { toast } = useToast();
    const { user, dbUser, loading, updateDbUser } = useAuth();
    const router = useRouter();
    const [isActionLoading, setIsActionLoading] = React.useState(false);
    
    const channelConnected = !!dbUser?.youtubeChannelId;

    const handleConnect = async () => {
        setIsActionLoading(true);
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
        try {
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;
            if (firebaseUser) {
                 const updatedDbUser = await upsertUser({ 
                    id: firebaseUser.uid, 
                    email: firebaseUser.email, 
                    displayName: firebaseUser.displayName, 
                    avatar: firebaseUser.photoURL 
                });
                
                if (updatedDbUser) {
                    updateDbUser(updatedDbUser);
                }
                
                toast({ title: "Connected!", description: "YouTube channel successfully connected." });
                router.push('/dashboard/analytics');
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Connection Failed", description: "Could not connect to YouTube." });
        } finally {
            setIsActionLoading(false);
        }
    }

    const handleDisconnect = async () => {
        setIsActionLoading(true);
        if (dbUser) {
           await updateUser(dbUser.id, { youtubeChannelId: undefined, platformsConnected: [] });
           updateDbUser({ youtubeChannelId: undefined, platformsConnected: [] });
           toast({ title: "Channel Disconnected", description: "Your YouTube channel has been disconnected."});
        }
        setIsActionLoading(false);
    }

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
                Manage your profile and connected platforms.
            </p>
        </div>
         <Separator />
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your profile is managed through your connected social accounts.</CardDescription>
            </CardHeader>
             <CardContent>
                <div className="flex items-center gap-6">
                    {loading ? <Skeleton className="w-24 h-24 rounded-full" /> : (
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} data-ai-hint="profile picture" />
                        <AvatarFallback>{user?.displayName?.charAt(0) ?? 'C'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-2">
                         <div className="space-y-1">
                            <Label>Display Name</Label>
                            {loading ? <Skeleton className="h-10 w-full max-w-xs" /> : <Input value={user?.displayName || ''} disabled className="max-w-xs" />}
                        </div>
                         <div className="space-y-1">
                            <Label>Email</Label>
                            {loading ? <Skeleton className="h-10 w-full max-w-xs" /> : <Input value={user?.email || ''} disabled className="max-w-xs" />}
                        </div>
                    </div>
                </div>
            </CardContent>
             <CardFooter className="border-t pt-6 flex justify-between">
                  <Button variant="outline" onClick={() => firebaseSignOut(auth)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => toast({ description: "Account deletion is not implemented in this prototype."})}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
                <CardDescription>Connect your accounts to enable content monitoring and analytics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <Youtube className="w-8 h-8 text-red-600" />
                        <div>
                            <h3 className="font-semibold">YouTube</h3>
                            {loading ? <Skeleton className="h-4 w-40 mt-1" /> : channelConnected ? (
                                <p className="text-sm text-muted-foreground">
                                    Connected as: {dbUser?.displayName}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Not connected. Analytics and monitoring are disabled.
                                </p>
                            )}
                        </div>
                    </div>
                    {loading ? <Skeleton className="h-10 w-28" /> : channelConnected ? (
                         <div className="flex items-center gap-4">
                             {user?.photoURL && <Avatar>
                                 <AvatarImage src={user.photoURL} data-ai-hint="channel icon" />
                                 <AvatarFallback>{dbUser?.displayName?.charAt(0)}</AvatarFallback>
                             </Avatar>}
                             <Button variant="destructive" onClick={handleDisconnect} disabled={isActionLoading}>
                                 {isActionLoading && <Loader2 className="mr-2 animate-spin" />}
                                 Disconnect
                            </Button>
                         </div>
                    ) : (
                       <Button onClick={handleConnect} disabled={isActionLoading}>
                           {isActionLoading && <Loader2 className="mr-2 animate-spin" />}
                           Connect
                       </Button>
                    )}
                </div>
            </CardContent>
        </Card>

        <ThemeSettings />
    </div>
  )
}
