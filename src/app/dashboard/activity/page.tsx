
'use client';
import ActivityClientPage from './activity-client-page';
import { getDashboardData } from '../actions';
import { unstable_noStore as noStore } from 'next/cache';
import type { DashboardData } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useUser } from '@/context/user-context';
import { Loader2 } from 'lucide-react';

export default function ActivityPage() {
    noStore();
    const { user } = useUser();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getDashboardData().then(data => {
                setData(data);
                setIsLoading(false);
            });
        }
    }, [user]);

    if(isLoading) {
        return <div className="flex items-center justify-center h-full py-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
    }
    
    return <ActivityClientPage initialData={data} />;
}
