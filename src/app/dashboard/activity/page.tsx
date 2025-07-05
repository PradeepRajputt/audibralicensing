
'use client';
import { getDashboardData } from '../actions';
import type { DashboardData } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ActivityClientPage from './activity-client-page';

export default function ActivityPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getDashboardData().then(data => {
            setData(data);
            setIsLoading(false);
        });
    }, []);

    if(isLoading) {
        return <div className="flex items-center justify-center h-full py-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
    }
    
    return <ActivityClientPage initialData={data} />;
}
