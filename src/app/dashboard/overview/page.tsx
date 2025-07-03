
import DashboardClientPage from '../dashboard-client-page';
import { unstable_noStore as noStore } from 'next/cache';

export default function OverviewPage() {
    noStore();
    return <DashboardClientPage />;
}
