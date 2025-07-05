
'use client';
import { getDashboardData } from '../actions';
import type { DashboardData } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ActivityClientPage from './activity-client-page';
import { useAuth } from '@/context/auth-context';

export default function ActivityPage() {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getDashboardData(user.uid).then(data => {
                setData(data);
                setIsLoading(false);
            });
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    if(isLoading) {
        return <div className="flex items-center justify-center h-full py-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
    }
    
    return <ActivityClientPage initialData={data} />;
}
