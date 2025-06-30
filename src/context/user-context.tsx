
'use client';

import * as React from 'react';
import { getDashboardData } from '@/app/dashboard/actions';
import { useSession } from 'next-auth/react';

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
type AnalyticsData = NonNullable<DashboardData>['analytics'];
type ActivityData = NonNullable<DashboardData>['activity'];
type UserStatus = 'active' | 'suspended' | 'deactivated';

interface UserContextType {
    data: DashboardData | null;
    analytics: AnalyticsData | null;
    activity: ActivityData | null;
    isLoading: boolean;
    creatorName: string | undefined;
    creatorImage: string | undefined;
    status: UserStatus;
    setStatus: React.Dispatch<React.SetStateAction<UserStatus>>;
}

const UserContext = React.createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status: sessionStatus } = useSession();
    const [data, setData] = React.useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [status, setStatus] = React.useState<UserStatus>('active');

    React.useEffect(() => {
        if (sessionStatus === 'loading') {
            setIsLoading(true);
            return;
        }

        const storedStatus = localStorage.getItem('user_status') as UserStatus;
        if (storedStatus) {
            setStatus(storedStatus);
        }

        // Prioritize localStorage ID, then session ID from Google Sign-In.
        const storedChannelData = localStorage.getItem('creator_shield_youtube_channel');
        const localStorageChannelId = storedChannelData ? JSON.parse(storedChannelData).id : undefined;
        const sessionChannelId = session?.user?.youtubeChannelId;
        
        const channelIdToFetch = localStorageChannelId || sessionChannelId;

        // If a channel ID is available (from any source), fetch its data.
        // Otherwise, it might be a new user or config issue, so `getDashboardData` will handle it.
        getDashboardData(channelIdToFetch).then(dashboardData => {
            setData(dashboardData);
            setIsLoading(false);
        });

    }, [status, session, sessionStatus]);

    const value = {
        data,
        analytics: data?.analytics ?? null,
        activity: data?.activity ?? [],
        isLoading,
        creatorName: data?.creatorName,
        creatorImage: data?.creatorImage,
        status,
        setStatus,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
    const context = React.useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
