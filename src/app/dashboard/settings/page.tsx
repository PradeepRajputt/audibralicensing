
import SettingsClientPage from './settings-client-page';
import { getUserById } from '@/lib/users-store';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  noStore();
  // In a real app, you would get this from the session. 
  const userId = "user_creator_123";
  const user = await getUserById(userId);

  return <SettingsClientPage initialUser={user} />;
}
