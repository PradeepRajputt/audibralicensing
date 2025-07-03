
import DashboardClientPage from './dashboard-client-page';
import { getDashboardData } from './actions';
import { unstable_noStore as noStore } from 'next/cache';

export default async function DashboardPage() {
    noStore();
    const data = await getDashboardData();
    
    // Since we're using mock data now, we can pass it directly.
    return <DashboardClientPage initialData={data} />;
}
