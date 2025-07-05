'use client';

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Youtube, Loader2, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useYouTube } from "@/context/youtube-context";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { connectYouTubeChannelAction } from './actions';

export default function SettingsClientPage() {
    const { toast } = useToast();
    const { isYouTubeConnected, setIsYouTubeConnected, channelId, setChannelId } = useYouTube();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [inputChannelId, setInputChannelId] = React.useState('');

    React.useEffect(() => {
        if(isYouTubeConnected && channelId) {
            setInputChannelId(channelId);
        }
    }, [isYouTubeConnected, channelId])

    const handleConnect = async () => {
        if (!inputChannelId.trim()) {
            toast({
                variant: 'destructive',
                title: 'Channel ID Required',
                description: 'Please enter a valid YouTube Channel ID.'
            });
            return;
        }

        setIsLoading(true);
        const result = await connectYouTubeChannelAction(inputChannelId);
        
        if (result.success) {
            setIsYouTubeConnected(true);
            setChannelId(inputChannelId);
            setIsDialogOpen(false);
            toast({
                title: "YouTube Account Connected",
                description: result.message
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Connection Failed',
                description: result.message,
            });
        }
        setIsLoading(false);
    }

    const handleDisconnect = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsYouTubeConnected(false);
            setChannelId(null);
            setInputChannelId('');
            toast({
                title: "YouTube Account Disconnected",
                description: "Your account has been disconnected.",
                variant: "destructive"
            });
            setIsLoading(false);
        }, 500); // Simulate a small delay
    }
    
  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
                Manage your connected accounts and application settings.
            </p>
        </div>
        
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
                            {isYouTubeConnected ? (
                                <p className="text-sm text-green-500">Connected</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">Not connected</p>
                            )}
                        </div>
                    </div>
                     {isYouTubeConnected ? (
                         <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Disconnect
                         </Button>
                     ) : (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Connect</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Connect YouTube Channel</DialogTitle>
                                    <DialogDescription>
                                        Enter your YouTube Channel ID to link your account.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="channelId" className="text-right">
                                        Channel ID
                                        </Label>
                                        <Input
                                        id="channelId"
                                        value={inputChannelId}
                                        onChange={(e) => setInputChannelId(e.target.value)}
                                        className="col-span-3"
                                        placeholder="UC..."
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                     <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                    <Button onClick={handleConnect} disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Connect Channel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                     )}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
