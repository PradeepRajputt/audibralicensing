
import ActivityClientPage from './activity-client-page';
import { getDashboardData } from '../actions';
import { unstable_noStore as noStore } from 'next/cache';
import type { DashboardData } from '@/lib/types';

export default async function ActivityPage() {
    noStore();
    // getDashboardData already returns sanitized data
    const data = await getDashboardData() as DashboardData | null;
    
    return <ActivityClientPage initialData={data} />;
}
