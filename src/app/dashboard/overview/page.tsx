
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Eye, Video, Youtube as YouTube, LogIn } from 'lucide-react';
import { useYouTube } from '@/context/youtube-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useDashboardData } from '../dashboard-context';
import { useEffect, useRef, useState } from 'react';
import { InteractiveLoader } from '@/components/ui/loader';

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
                <YouTube className="w-12 h-12 text-primary" />
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

// Animated count-up number component
function CountUpNumber({ end, duration = 1.2, className = '' }: { end: number, duration?: number, className?: string }) {
  const [value, setValue] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const prevValue = useRef(0);
  const startTimestamp = useRef<number | null>(null);

  useEffect(() => {
    let frame: number;
    function animateCountUp(timestamp: number) {
      if (!startTimestamp.current) startTimestamp.current = timestamp;
      const progress = Math.min((timestamp - startTimestamp.current) / (duration * 1000), 1);
      const nextValue = Math.floor(progress * end);
      if (nextValue !== prevValue.current) {
        setValue(nextValue);
        setAnimKey(prev => prev + 1);
        prevValue.current = nextValue;
      }
      if (progress < 1) {
        frame = requestAnimationFrame(animateCountUp);
      } else {
        setValue(end);
        setAnimKey(prev => prev + 1);
        prevValue.current = end;
      }
    }
    frame = requestAnimationFrame(animateCountUp);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line
  }, [end, duration]);

  return (
    <span
      key={value + '-' + animKey}
      className={
        `${className} inline-block transition-transform duration-300 ease-out animate-rise-up text-center`
      }
      style={{ willChange: 'transform' }}
    >
      {value.toLocaleString()}
    </span>
  );
}

// Add a helper function to format numbers with K, M, B suffixes
function formatApproxNumber(num: number): string {
  if (num >= 1_000_000_000) return (Math.floor(num / 100_000_000) / 10) + 'B';
  if (num >= 1_000_000) return (Math.floor(num / 100_000) / 10) + 'M';
  if (num >= 1_000) return (Math.floor(num / 100) / 10) + 'K';
  return num.toString();
}


export default function OverviewPage() {
    const dashboardData = useDashboardData();
    const { isYouTubeConnected } = useYouTube();
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    
    // Data is loading if we don't have dashboardData BUT a connection is expected/established
    const isLoading = !dashboardData && isYouTubeConnected;

    const analytics = dashboardData?.analytics;
    const user = dashboardData?.user;
    const creatorName = user?.youtubeChannel?.title || user?.displayName || user?.name || user?.email || 'Creator';
    // Prefer YouTube channel thumbnail, then avatar
    const avatar = user?.youtubeChannel?.thumbnail || user?.avatar || undefined;
    const avatarFallback = creatorName ? creatorName.charAt(0) : 'C';

    if(isLoading) {
       return <InteractiveLoader show={true} />;
    }
    
    if (!isYouTubeConnected) {
        return <ConnectYoutubePlaceholder />;
    }
    
    return (
        <div className="space-y-6">
            {/* Profile Picture Zoom Modal */}
            {showAvatarModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAvatarModal(false)}>
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <img
                    src={avatar}
                    srcSet={avatar + ' 1x, ' + avatar + ' 2x'}
                    sizes="(min-width: 640px) 320px, 100vw"
                    alt={creatorName}
                    title={creatorName + ' profile picture'}
                    className="w-80 h-80 object-cover rounded-full shadow-2xl border-4 border-background scale-100 animate-zoom-in"
                    style={{ imageRendering: 'crisp-edges' }}
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                  <button
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition"
                    onClick={() => setShowAvatarModal(false)}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            {/* Animated Welcome Section */}
            <div className="relative flex items-center gap-4 p-6 rounded-xl overflow-hidden bg-background shadow-xl animate-fade-in">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-muted via-transparent to-transparent pointer-events-none" />
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg animate-fade-in-up cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                    <AvatarImage src={avatar} alt={creatorName} data-ai-hint="profile picture" />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="z-10">
                    <h1 className="text-4xl font-extrabold bg-clip-text text-foreground animate-gradient-x drop-shadow-lg">Welcome back, {creatorName}!</h1>
                    <p className="text-lg text-muted-foreground mt-2 animate-fade-in">Here's a quick look at your channel's performance.</p>
                </div>
            </div>
            {/* Animated Stats Cards */}
            {!analytics ? (
                <Card className="text-center w-full animate-fade-in-up">
                    <CardHeader>
                        <CardTitle>Analytics Data Unavailable</CardTitle>
                        <CardDescription>We couldn't fetch your YouTube analytics. Please check your connection or try again later.</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-background border animate-fade-in-up group cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between pb-1">
                            <CardTitle className="text-sm font-medium text-foreground">Subscribers</CardTitle>
                            <Users className="h-6 w-6 text-primary animate-bounce infinite group-hover:animate-wiggle" />
                        </CardHeader>
                        <CardContent className="pt-2 pb-4 flex flex-col items-start gap-2">
                            <div className="text-2xl font-extrabold text-foreground group-hover:animate-pulse mb-2">
                                {formatApproxNumber(analytics.subscribers)}
                            </div>
                            <p className="text-xs text-muted-foreground">Total all-time subscribers</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-background border animate-fade-in-up delay-100 group cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between pb-1">
                            <CardTitle className="text-sm font-medium text-foreground">Total Views</CardTitle>
                            <Eye className="h-6 w-6 text-primary animate-bounce infinite group-hover:animate-wiggle" />
                        </CardHeader>
                        <CardContent className="pt-2 pb-4 flex flex-col items-start gap-2">
                            <div className="text-2xl font-extrabold text-foreground group-hover:animate-pulse mb-2">
                                {formatApproxNumber(analytics.views)}
                            </div>
                            <p className="text-xs text-muted-foreground">Across all your videos</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-background border animate-fade-in-up delay-200 group cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between pb-1">
                            <CardTitle className="text-sm font-medium text-foreground">Most Viewed Video</CardTitle>
                            <Video className="h-6 w-6 text-primary animate-bounce infinite group-hover:animate-wiggle" />
                        </CardHeader>
                        <CardContent className="pt-2 pb-4 flex flex-col items-start gap-2">
                            <div className="text-base font-bold truncate text-foreground group-hover:animate-pulse mb-2">
                                {(analytics.mostViewedVideo.title || '').length > 30
                                  ? (analytics.mostViewedVideo.title || '').slice(0, 30) + '...'
                                  : (analytics.mostViewedVideo.title || '')}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {typeof analytics.mostViewedVideo.views === 'number' ? analytics.mostViewedVideo.views.toLocaleString() : 0} views
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
