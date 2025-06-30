
'use client';

import * as React from 'react';

type UserStatus = 'active' | 'suspended' | 'deactivated';

const mockData = {
    analytics: {
        subscribers: 123456,
        views: 12345678,
        mostViewedVideo: {
            title: "My Most Viral Video Ever!",
            views: 2300000
        },
        dailyData: Array.from({ length: 90 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (89 - i));
            const dayFactor = (i + 1) / 90;
            const randomFactor = 0.8 + Math.random() * 0.4;
            return {
                date: date.toISOString().split('T')[0],
                views: Math.floor((12345678 / 90) * dayFactor * randomFactor * 1.5),
                subscribers: Math.floor((123456 / 2000) * dayFactor * randomFactor + Math.random() * 5),
            };
        })
    },
    activity: [
        {
          type: "New Infringement Detected",
          details: "On website 'stolencontent.com/my-video'",
          status: "Action Required",
          date: `1 hour ago`,
          variant: "destructive"
        },
        {
          type: "YouTube Scan Complete",
          details: `Channel 'Sample Creator' scanned.`,
          status: "No Issues",
          date: "1 day ago",
          variant: "default"
        },
    ],
    creatorName: 'Sample Creator',
    creatorImage: 'https://placehold.co/128x128.png',
};

interface UserContextType {
    analytics: typeof mockData.analytics | null;
    activity: typeof mockData.activity | null;
    isLoading: boolean;
    creatorName: string | undefined;
    creatorImage: string | undefined;
    status: UserStatus;
    setStatus: React.Dispatch<React.SetStateAction<UserStatus>>;
}

const UserContext = React.createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [status, setStatus] = React.useState<UserStatus>('active');

    React.useEffect(() => {
        const storedStatus = localStorage.getItem('user_status') as UserStatus;
        if (storedStatus) {
            setStatus(storedStatus);
        }
    }, []);


    const value = {
        analytics: mockData.analytics,
        activity: mockData.activity,
        isLoading,
        creatorName: mockData.creatorName,
        creatorImage: mockData.creatorImage,
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
