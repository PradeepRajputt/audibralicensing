
'use client';

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Youtube, Loader2, Trash2, LogOut, KeyRound } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { disconnectYoutubeChannelAction } from '@/app/dashboard/actions';
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

export default function SettingsClientPage() {
    const { data: session, status, update: updateSession } = useSession();
    const [isActionLoading, setIsActionLoading] = React.useState(false);
    const { toast } = useToast();
    
    const user = session?.user;
    const isLoading = status === 'loading';
    const channelConnected = !!user?.youtubeChannelId;

    const handleDisconnect = async () => {
        setIsActionLoading(true);
        // This part needs a server action if we want to clear it from the database.
        // For now, it will just sign the user out which effectively disconnects.
        toast({ title: "Channel Disconnected", description: "You have been signed out."});
        signOut({ callbackUrl: '/' });
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
                    {isLoading ? <Skeleton className="w-24 h-24 rounded-full" /> : (
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ''} data-ai-hint="profile picture" />
                        <AvatarFallback>{user?.name?.substring(0,2) ?? 'C'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-2">
                         <div className="space-y-1">
                            <Label>Display Name</Label>
                            {isLoading ? <Skeleton className="h-10 w-full max-w-xs" /> : <Input value={user?.name || ''} disabled className="max-w-xs" />}
                        </div>
                         <div className="space-y-1">
                            <Label>Email</Label>
                            {isLoading ? <Skeleton className="h-10 w-full max-w-xs" /> : <Input value={user?.email || ''} disabled className="max-w-xs" />}
                        </div>
                    </div>
                </div>
            </CardContent>
             <CardFooter className="border-t pt-6 flex justify-between">
                  <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
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
                            {isLoading ? <Skeleton className="h-4 w-40 mt-1" /> : user ? (
                                <p className="text-sm text-muted-foreground">
                                    Connected as: {user.name}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Not connected. Analytics and monitoring are disabled.
                                </p>
                            )}
                        </div>
                    </div>
                    {isLoading ? <Skeleton className="h-10 w-28" /> : user ? (
                         <div className="flex items-center gap-4">
                             <Avatar>
                                 <AvatarImage src={user.image!} data-ai-hint="channel icon" />
                                 <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <Button variant="destructive" onClick={handleDisconnect} disabled={isActionLoading}>
                                 {isActionLoading && <Loader2 className="mr-2 animate-spin" />}
                                 Disconnect
                            </Button>
                         </div>
                    ) : (
                       <Button onClick={() => signIn('google')}>Connect</Button>
                    )}
                </div>
            </CardContent>
        </Card>

        <ThemeSettings />
    </div>
  )
}
