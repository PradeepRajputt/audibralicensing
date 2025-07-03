
import SettingsClientPage from './settings-client-page';
import { getUserById } from '@/lib/users-store';
import { unstable_noStore as noStore } from 'next/cache';
import { getSession } from '@/lib/session';
import type { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  noStore();
  const session = await getSession();
  // In a real app, you would get this from the session. 
  const userId = session?.uid || "user_creator_123";
  const dbUser = await getUserById(userId);
  const user = dbUser ? JSON.parse(JSON.stringify(dbUser)) as User : undefined;

  return <SettingsClientPage initialUser={user} />;
}
