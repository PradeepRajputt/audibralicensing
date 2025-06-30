'use client';
    
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Youtube, Globe } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "../actions";
import { useEffect, useState } from "react";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function SettingsPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getDashboardData().then(dashboardData => {
            setData(dashboardData);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
                <Separator />
                <div className="space-y-6">
                    <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Could not load settings</CardTitle>
                    <CardDescription>Please ensure your YouTube API Key and Channel ID are configured correctly.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
                Viewing settings for the configured YouTube channel.
            </p>
        </div>
         <Separator />
        <Card>
            <CardHeader>
                <CardTitle>Monitored Creator Profile</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24">
                        <AvatarImage src={data.creatorImage ?? "https://placehold.co/128x128.png"} alt="Creator Avatar" data-ai-hint="profile picture" />
                        <AvatarFallback>{data.creatorName?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                       <p className="font-medium text-lg">{data.creatorName}</p>
                       <p className="text-sm text-muted-foreground">This is the YouTube channel currently being monitored.</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
                <CardDescription>The platforms CreatorShield is configured to monitor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <Youtube className="w-8 h-8 text-red-600" />
                        <div>
                            <h3 className="font-semibold">YouTube</h3>
                            <p className="text-sm text-muted-foreground">
                                Actively monitoring for video and audio content.
                            </p>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <Globe className="w-8 h-8" />
                        <div>
                            <h3 className="font-semibold">Web</h3>
                            <p className="text-sm text-muted-foreground">
                               Actively monitoring for text and image content.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
