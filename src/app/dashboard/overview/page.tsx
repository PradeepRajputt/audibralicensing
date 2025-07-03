
import DashboardClientPage from '../dashboard-client-page';
import { getDashboardData } from '../actions';
import { unstable_noStore as noStore } from 'next/cache';

export default async function OverviewPage() {
    noStore();
    const data = await getDashboardData();
    // No need to sanitize here because getDashboardData already does it
    return <DashboardClientPage initialData={data} />;
}
