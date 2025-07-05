
'use client';
import { getDashboardData } from '../actions';
import { unstable_noStore as noStore } from 'next/cache';
import type { DashboardData } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import ActivityClientPage from './activity-client-page';

export default function ActivityPage() {
    noStore();
    const { data: session, status } = useSession();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') {
            getDashboardData().then(data => {
                setData(data);
                setIsLoading(false);
            });
        } else if (status === 'unauthenticated') {
            setIsLoading(false);
        }
    }, [status]);

    if(isLoading || status === 'loading') {
        return <div className="flex items-center justify-center h-full py-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
    }
    
    return <ActivityClientPage initialData={data} />;
}
