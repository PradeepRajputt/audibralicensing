
'use client';
import type { DashboardData } from '@/lib/types';
import ActivityClientPage from './activity-client-page';
import { useDashboardData } from '../dashboard-context';
import { useYouTube } from '@/context/youtube-context';

export default function ActivityPage() {
    const dashboardData = useDashboardData();
    const { isYouTubeConnected } = useYouTube();
    const isLoading = !dashboardData && isYouTubeConnected;
    
    return <ActivityClientPage initialData={dashboardData} isLoading={isLoading} />;
}
