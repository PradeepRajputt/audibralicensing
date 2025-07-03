
import ActivityClientPage from './activity-client-page';
import { getDashboardData } from '../actions';
import { unstable_noStore as noStore } from 'next/cache';
import type { DashboardData, User } from '@/lib/types';

export default async function ActivityPage() {
    noStore();
    const data = await getDashboardData();
    
    // Sanitize data before passing to client component
    const sanitizedData = data ? {
        ...data,
        user: data.user ? {
            uid: data.user.uid,
            displayName: data.user.displayName,
            email: data.user.email,
            role: data.user.role,
            joinDate: data.user.joinDate,
            platformsConnected: data.user.platformsConnected,
            youtubeChannelId: data.user.youtubeChannelId,
            status: data.user.status,
            avatar: data.user.avatar,
        } as User : undefined,
        // Assuming activity and analytics are already plain objects
        activity: JSON.parse(JSON.stringify(data.activity)),
        analytics: data.analytics ? JSON.parse(JSON.stringify(data.analytics)) : null,
    } as DashboardData : null;
    
    return <ActivityClientPage initialData={sanitizedData} />;
}
