
import SettingsClientPage from './settings-client-page';
import { getUserById } from '@/lib/users-store';
import { unstable_noStore as noStore } from 'next/cache';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  noStore();
  const session = await getSession();
  // In a real app, you would get this from the session. 
  const userId = session?.uid || "user_creator_123";
  const user = await getUserById(userId);

  return <SettingsClientPage initialUser={user} />;
}
