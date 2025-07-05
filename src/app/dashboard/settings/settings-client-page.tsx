
'use client';

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Youtube, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useYouTube } from "@/context/youtube-context";

export default function SettingsClientPage() {
    const { toast } = useToast();
    const { isYouTubeConnected, setIsYouTubeConnected } = useYouTube();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleConnect = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsYouTubeConnected(true);
            toast({
                title: "YouTube Account Connected",
                description: "You can now access all creator features."
            });
            setIsLoading(false);
        }, 1500);
    }

    const handleDisconnect = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsYouTubeConnected(false);
            toast({
                title: "YouTube Account Disconnected",
                description: "Your account has been disconnected.",
                variant: "destructive"
            });
            setIsLoading(false);
        }, 1000);
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
                        <Button variant="outline" onClick={handleConnect} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Connect YouTube
                        </Button>
                     )}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
