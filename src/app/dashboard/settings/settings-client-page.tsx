
'use client';

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Youtube, Loader2, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { useSession } from 'next-auth/react';
import jwt from 'jsonwebtoken';
import { useDashboardRefresh } from '@/app/dashboard/dashboard-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function getEmailFromJWT() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('creator_jwt');
  if (!token) return null;
  try {
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded === 'object' && 'email' in decoded) {
      return (decoded as { email?: string }).email || null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function SettingsClientPage() {
    const { toast } = useToast();
    const { isYouTubeConnected, setIsYouTubeConnected, channelId, setChannelId } = useYouTube();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [inputChannelId, setInputChannelId] = React.useState('');
    const [connectResult, setConnectResult] = React.useState<{success: boolean, message: string} | null>(null);
    const closeTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const dashboardRefresh = useDashboardRefresh();
    const [showFirstConnectModal, setShowFirstConnectModal] = React.useState(false);
    const [hasConnectedOnce, setHasConnectedOnce] = React.useState(false);

    React.useEffect(() => {
        if(isYouTubeConnected && channelId) {
            setInputChannelId(channelId);
        }
        return () => { if (closeTimeout.current) clearTimeout(closeTimeout.current); };
    }, [isYouTubeConnected, channelId]);

    React.useEffect(() => {
        // Check localStorage if user has ever connected a channel
        const connected = localStorage.getItem('hasConnectedYouTube');
        setHasConnectedOnce(!!connected);
        if (!connected && !isYouTubeConnected) {
            setShowFirstConnectModal(true);
        }
        if (isYouTubeConnected) {
            localStorage.setItem('hasConnectedYouTube', 'true');
        }
    }, [isYouTubeConnected, channelId]);

    const handleConnect = async () => {
        setConnectResult(null);
        if (!inputChannelId.trim()) {
            setConnectResult({ success: false, message: 'Please enter a valid YouTube Channel ID.' });
            return;
        }
        const email = getEmailFromJWT();
        if (!email) {
            setConnectResult({ success: false, message: 'Could not determine your email. Please log in again.' });
            return;
        }
        setIsLoading(true);
        const result = await connectYouTubeChannelAction(inputChannelId, email);
        setIsLoading(false);
        setConnectResult(result);
        if (result && result.success) {
            setIsYouTubeConnected(true);
            setChannelId(inputChannelId);
            closeTimeout.current = setTimeout(async () => {
                setIsDialogOpen(false);
                setConnectResult(null);
                toast({
                  title: 'YouTube Channel Connected',
                  description: result.message + ' Please login again to see your updated dashboard.',
                  variant: 'default',
                });
                if (dashboardRefresh) await dashboardRefresh();
                localStorage.setItem('hasConnectedYouTube', 'true');
                // Force logout and redirect to login for a guaranteed fresh dashboard
                localStorage.removeItem('creator_jwt');
                window.location.href = '/auth/login';
            }, 1500);
        }
    }

    const handleDisconnect = async () => {
        setIsLoading(true);
        setTimeout(async () => {
            setIsYouTubeConnected(false);
            setChannelId(null);
            setInputChannelId('');
            toast({
                title: "YouTube Account Disconnected",
                description: "Your account has been disconnected.",
                variant: "destructive"
            });
            setIsLoading(false);
            // Refresh dashboard context instead of full reload
            if (dashboardRefresh) await dashboardRefresh();
        }, 500); // Simulate a small delay
    }
    
  return (
    <div className="space-y-6">
        {/* First-Time Connect Modal */}
        {showFirstConnectModal && !hasConnectedOnce && (
          <Dialog open={showFirstConnectModal} onOpenChange={setShowFirstConnectModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Important: One-Time Channel Connection</DialogTitle>
                <DialogDescription>
                  You can only connect your YouTube channel <b>once</b>.<br/>
                  Please provide the correct Channel ID.<br/>
                  <span className="text-destructive font-semibold">If you connect the wrong channel, you cannot disconnect it yourself. You must submit a request to the admin via the feedback form.</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setShowFirstConnectModal(false)}>I Understand</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button variant="destructive" disabled>
                                  Disconnect
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              You cannot disconnect your channel yourself. Please contact admin via feedback form.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                     ) : (
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); setConnectResult(null); }}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Connect</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
                                <div className="bg-red-600 flex flex-col items-center justify-center py-8">
                                    <Youtube className="w-14 h-14 text-white mb-3" />
                                    <span className="text-white font-bold text-xl">Connect YouTube Channel</span>
                                </div>
                                <div className="px-10 py-10 bg-background">
                                    <DialogHeader>
                                        <DialogTitle className="mb-4 text-lg">Enter Channel ID</DialogTitle>
                                        <DialogDescription className="mb-8 text-base">
                                            Paste your YouTube Channel ID to link your account.<br />
                                            <a href="https://support.google.com/youtube/answer/3250431?hl=en" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">How to find your Channel ID?</a>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-6 mb-6">
                                        <Label htmlFor="channelId">Channel ID</Label>
                                        <Input
                                            id="channelId"
                                            value={inputChannelId}
                                            onChange={(e) => setInputChannelId(e.target.value)}
                                            placeholder="UC..."
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {connectResult && (
                                        <div className={`flex items-center gap-2 mt-6 text-base rounded-md px-4 py-3 ${connectResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {connectResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            {connectResult.message}
                                        </div>
                                    )}
                                    <DialogFooter className="mt-10 flex flex-row gap-3 justify-end">
                                        <DialogClose asChild><Button variant="ghost" disabled={isLoading}>Cancel</Button></DialogClose>
                                        <Button onClick={handleConnect} disabled={isLoading} className="relative">
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isLoading ? 'Connecting...' : 'Connect Channel'}
                                            {isLoading && <span className="absolute inset-0 bg-white/60 flex items-center justify-center z-10" />}
                                        </Button>
                                    </DialogFooter>
                                </div>
                            </DialogContent>
                        </Dialog>
                     )}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
