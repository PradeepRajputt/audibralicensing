
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Eye, Video, Youtube, LogIn } from 'lucide-react';
import { useYouTube } from '@/context/youtube-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useDashboardData } from '../dashboard-context';

function OverviewLoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
            </div>
        </div>
    );
}

function ConnectYoutubePlaceholder() {
    const router = useRouter();
    return (
       <Card className="text-center w-full max-w-lg mx-auto">
          <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Youtube className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="mt-4">Connect Your YouTube Account</CardTitle>
              <CardDescription>To view your dashboard and see real-time data, please connect your YouTube channel.</CardDescription>
          </CardHeader>
          <CardContent>
              <Button onClick={() => router.push('/dashboard/settings')}>
                  <LogIn className="mr-2 h-5 w-5" />
                  Connect YouTube in Settings
              </Button>
          </CardContent>
      </Card>
    )
}


export default function OverviewPage() {
    const dashboardData = useDashboardData();
    const { isYouTubeConnected } = useYouTube();
    
    // Data is loading if we don't have dashboardData BUT a connection is expected/established
    const isLoading = !dashboardData && isYouTubeConnected;

    const analytics = dashboardData?.analytics;
    const user = dashboardData?.user;
    const creatorName = user?.youtubeChannel?.title || user?.displayName || user?.name || user?.email || 'Creator';
    const avatar = user?.avatar;
    const avatarFallback = creatorName ? creatorName.charAt(0) : 'C';

    if(isLoading) {
       return <OverviewLoadingSkeleton />;
    }
    
    if (!isYouTubeConnected) {
        return <ConnectYoutubePlaceholder />;
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={avatar ?? undefined} alt={creatorName} data-ai-hint="profile picture" />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {creatorName}!</h1>
                    <p className="text-muted-foreground">Here's a quick look at your channel's performance.</p>
                </div>
            </div>
            
            {!analytics ? (
                <Card className="text-center w-full">
                    <CardHeader>
                        <CardTitle>Analytics Data Unavailable</CardTitle>
                        <CardDescription>We couldn't fetch your YouTube analytics. Please check your connection or try again later.</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.subscribers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total all-time subscribers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.views.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Across all your videos</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Most Viewed Video</CardTitle>
                            <Video className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold truncate">{analytics.mostViewedVideo.title}</div>
                            <p className="text-xs text-muted-foreground">{'number' === typeof analytics.mostViewedVideo.views ? analytics.mostViewedVideo.views.toLocaleString() : 'N/A'} views</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
