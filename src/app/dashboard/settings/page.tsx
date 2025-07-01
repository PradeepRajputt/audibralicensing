
'use client';

import * as React from "react";
import { useFormState, useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Youtube } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { verifyYoutubeChannel } from './actions';
import { useRouter } from "next/navigation";


const LOCAL_STORAGE_KEY = 'creator_shield_youtube_channel';

type ConnectedChannel = {
  id: string;
  name: string;
  avatar: string;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? 'Verifying...' : 'Verify & Connect'}</Button>;
}

export default function SettingsPage() {
    const router = useRouter();
    const [connectedChannel, setConnectedChannel] = React.useState<ConnectedChannel | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);

    const [state, formAction] = useFormState(verifyYoutubeChannel, null);

    React.useEffect(() => {
        const storedChannel = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedChannel) {
            setConnectedChannel(JSON.parse(storedChannel));
        }
    }, []);

    React.useEffect(() => {
        if (!state) return;
        if (state.success && state.channel) {
            toast({ title: "Success!", description: state.message });
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.channel));
            setConnectedChannel(state.channel);
            setIsDialogOpen(false);
        } else if (!state.success) {
            toast({ variant: 'destructive', title: "Verification Failed", description: state.message });
        }
    }, [state, toast]);
    
    const handleDisconnect = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setConnectedChannel(null);
        toast({ title: "Platform Disconnected", description: "Your YouTube channel has been disconnected." });
    }
  
    const onPasswordChangeClick = () => {
        toast({
            title: "Forgot Password",
            description: "In a real app, this would handle password changes or resets."
        });
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
                <CardDescription>This information is used to identify you on the platform.</CardDescription>
            </CardHeader>
             <CardContent>
                <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24">
                        <AvatarImage src="https://placehold.co/128x128.png" alt="User Avatar" data-ai-hint="profile picture" />
                        <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                         <div className="space-y-1">
                            <Label>Display Name</Label>
                            <Input value="Creator" disabled className="max-w-xs" />
                        </div>
                         <div className="space-y-1">
                            <Label>Email</Label>
                            <Input value="creator@example.com" disabled className="max-w-xs" />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between">
                <div>
                     <h3 className="font-medium">Account Security</h3>
                    <p className="text-sm text-muted-foreground">Manage your password and sign out.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onPasswordChangeClick}>Change Password</Button>
                    <Button variant="outline" onClick={() => router.push('/')}>Sign Out</Button>
                </div>
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
                            {connectedChannel ? (
                                <p className="text-sm text-muted-foreground">
                                    Connected as: {connectedChannel.name}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Connect your channel to monitor your videos.
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
                             <Button variant="destructive" onClick={handleDisconnect}>Disconnect</Button>
                         </div>
                    ) : (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Connect</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Connect your YouTube Channel</DialogTitle>
                                <DialogDescription>
                                    Please enter your YouTube Channel ID to start monitoring. You can find this in your YouTube Studio settings under `youtube.com/account_advanced`.
                                </DialogDescription>
                                </DialogHeader>
                                <form ref={formRef} action={formAction} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="channelId">Channel ID</Label>
                                        <Input id="channelId" name="channelId" placeholder="UCxxxxxxxxxxxxxxxxxxxxxx" />
                                    </div>
                                    <DialogFooter>
                                       <DialogClose asChild>
                                            <Button type="button" variant="ghost">Cancel</Button>
                                       </DialogClose>
                                       <SubmitButton />
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
