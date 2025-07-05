
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getDashboardData } from '../actions';
import type { DashboardData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Eye, Video, Youtube, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function LoadingSkeleton() {
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
                <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
            </div>
        </div>
    );
}


function ConnectYoutubePlaceholder() {
    return (
        <Card className="text-center w-full max-w-lg mx-auto">
          <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Youtube className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="mt-4">Connect Your YouTube Account</CardTitle>
              <CardDescription>To view your dashboard and see real-time data, please connect your YouTube channel in settings.</CardDescription>
          </CardHeader>
          <CardContent>
              <Button asChild>
                  <Link href="/dashboard/settings">
                      Go to Settings
                  </Link>
              </Button>
          </CardContent>
      </Card>
    )
}

function LoginPlaceholder() {
     return (
       <Card className="text-center w-full max-w-lg mx-auto">
          <CardHeader>
              <CardTitle>Welcome to CreatorShield</CardTitle>
              <CardDescription>To get started, please sign in.</CardDescription>
          </CardHeader>
          <CardContent>
              <Button onClick={async () => {
                  const provider = new GoogleAuthProvider();
                  await signInWithPopup(auth, provider);
              }}>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In with Google
              </Button>
          </CardContent>
      </Card>
    )
}


export default function OverviewPage() {
    const { user, dbUser, loading: authLoading } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoadingData(true);
            getDashboardData(user.uid).then(data => {
                setDashboardData(data);
                setIsLoadingData(false);
            })
        } else if (!authLoading) {
            setIsLoadingData(false);
        }
    }, [user, authLoading]);

    const isLoading = authLoading || isLoadingData;
    const analytics = dashboardData?.analytics;
    const creatorName = dbUser?.displayName ?? 'Creator';
    const avatar = dbUser?.avatar;
    const avatarFallback = creatorName.charAt(0);


    if(isLoading) {
        return <LoadingSkeleton />;
    }

    if (!user || !dbUser) {
        return <LoginPlaceholder />;
    }
    
    if (!analytics) {
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
        </div>
    )
}
