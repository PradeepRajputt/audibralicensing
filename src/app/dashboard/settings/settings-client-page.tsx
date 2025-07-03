
'use client';

import * as React from "react";
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Youtube, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { disconnectYoutubeChannelAction } from '@/app/dashboard/actions';
import { useRouter } from "next/navigation";
import type { User } from '@/lib/types';
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";


type ConnectedChannel = {
  id: string;
  name: string;
  avatar: string;
}

export default function SettingsClientPage({ initialUser }: { initialUser: User | undefined }) {
    const router = useRouter();
    const [user, setUser] = React.useState(initialUser);
    const [connectedChannel, setConnectedChannel] = React.useState<ConnectedChannel | null>(null);
    const [isActionLoading, setIsActionLoading] = React.useState(false);
    const { toast } = useToast();
    
    const isLoading = !user;

    // Effect to initialize the connected channel from user prop
    React.useEffect(() => {
        if (user?.youtubeChannelId && user?.displayName) {
             setConnectedChannel({
                id: user.youtubeChannelId,
                name: user.displayName,
                avatar: user.avatar || '',
             });
        } else {
          setConnectedChannel(null);
        }
    }, [user]);
    
    const handleDisconnect = async () => {
        setIsActionLoading(true);
        const result = await disconnectYoutubeChannelAction();
        if (result.success) {
            toast({ title: "Platform Disconnected", description: result.message });
            setConnectedChannel(null);
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: "Action Failed", description: result.message });
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
                <CardDescription>Your profile information is linked to your connected accounts.</CardDescription>
            </CardHeader>
             <CardContent>
                <div className="flex items-center gap-6">
                    {isLoading ? <Skeleton className="w-24 h-24 rounded-full" /> : (
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user?.avatar} alt={user?.displayName ?? ''} data-ai-hint="profile picture" />
                        <AvatarFallback>{user?.displayName?.substring(0, 2) ?? 'C'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-2">
                         <div className="space-y-1">
                            <Label>Display Name</Label>
                            {isLoading ? <Skeleton className="h-10 w-full max-w-xs" /> : <Input value={user?.displayName || ''} disabled className="max-w-xs" />}
                        </div>
                         <div className="space-y-1">
                            <Label>Email</Label>
                            {isLoading ? <Skeleton className="h-10 w-full max-w-xs" /> : <Input value={user?.email || ''} disabled className="max-w-xs" />}
                        </div>
                    </div>
                </div>
            </CardContent>
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
                            {connectedChannel ? (
                                <p className="text-sm text-muted-foreground">
                                    Connected as: {connectedChannel.name}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Not connected. Analytics and monitoring are disabled.
                                </p>
                            )}
                        </div>
                    </div>
                    {connectedChannel ? (
                         <div className="flex items-center gap-4">
                             <Avatar>
                                 <AvatarImage src={connectedChannel.avatar} data-ai-hint="channel icon" />
                                 <AvatarFallback>{connectedChannel.name.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <Button variant="destructive" onClick={handleDisconnect} disabled={isActionLoading}>
                                 {isActionLoading && <Loader2 className="mr-2 animate-spin" />}
                                 Disconnect
                            </Button>
                         </div>
                    ) : (
                       <Button asChild variant="outline">
                           <Link href="/dashboard/connect-platform">Connect</Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>

        <ThemeSettings />
    </div>
  )
}
