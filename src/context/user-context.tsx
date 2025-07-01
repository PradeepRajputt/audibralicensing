
'use client';

import * as React from 'react';
import { getDashboardData } from '@/app/dashboard/actions';
import { useSession } from 'next-auth/react';
import type { UserAnalytics } from '@/lib/types';
import type { Session } from 'next-auth';

type UserStatus = 'active' | 'suspended' | 'deactivated';

interface UserContextType {
    analytics: UserAnalytics | null;
    activity: any[] | null; // Replace with a strong type if you have one
    isLoading: boolean;
    creatorName: string | undefined;
    creatorImage: string | undefined;
    status: UserStatus;
    setStatus: React.Dispatch<React.SetStateAction<UserStatus>>;
}

const UserContext = React.createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status: sessionStatus } = useSession();
    const [isLoading, setIsLoading] = React.useState(true);
    const [dashboardData, setDashboardData] = React.useState<{
        analytics: UserAnalytics | null;
        activity: any[] | null;
        creatorName: string | undefined;
        creatorImage: string | undefined;
    }>({
        analytics: null,
        activity: null,
        creatorName: undefined,
        creatorImage: undefined,
    });
    
    const [userStatus, setUserStatus] = React.useState<UserStatus>('active');

    React.useEffect(() => {
        const storedStatus = localStorage.getItem('user_status') as UserStatus;
        if (storedStatus) {
            setUserStatus(storedStatus);
        }
    }, []);

    React.useEffect(() => {
        async function loadData() {
            if (sessionStatus === 'authenticated' && session?.user) {
                setIsLoading(true);
                try {
                    const data = await getDashboardData((session.user as any).youtubeChannelId);
                    if (data) {
                        setDashboardData({
                            analytics: data.analytics,
                            activity: data.activity,
                            creatorName: data.creatorName,
                            creatorImage: data.creatorImage
                        });
                    } else {
                        // Handle case where data could not be fetched (e.g. no API key)
                         setDashboardData({ analytics: null, activity: [], creatorName: session.user.name ?? undefined, creatorImage: session.user.image ?? undefined});
                    }
                } catch (error) {
                    console.error("Failed to load user dashboard data:", error);
                    setDashboardData({ analytics: null, activity: [], creatorName: session.user.name ?? undefined, creatorImage: session.user.image ?? undefined});
                } finally {
                    setIsLoading(false);
                }
            } else if (sessionStatus === 'unauthenticated') {
                setIsLoading(false);
            }
        }
        loadData();
    }, [session, sessionStatus]);


    const value = {
        analytics: dashboardData.analytics,
        activity: dashboardData.activity,
        isLoading,
        creatorName: dashboardData.creatorName,
        creatorImage: dashboardData.creatorImage,
        status: userStatus,
        setStatus: setUserStatus,
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
