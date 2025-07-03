
import DashboardClientPage from './dashboard-client-page';
import { getDashboardData } from './actions';
import { unstable_noStore as noStore } from 'next/cache';
import type { DashboardData } from '@/lib/types';

export default async function DashboardPage() {
    noStore();
    const data = await getDashboardData();
    // Sanitize data before passing to client component
    const sanitizedData = data ? JSON.parse(JSON.stringify(data)) as DashboardData : null;
    
    return <DashboardClientPage initialData={sanitizedData} />;
}
