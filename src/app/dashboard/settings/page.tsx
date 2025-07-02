
import { getUserById } from '@/lib/users-store';
import SettingsClientPage from './settings-client-page';
import type { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  // In a real app, you'd get this from the session, for now we hardcode it
  const userId = 'user_creator_123';
  const user = await getUserById(userId);

  return <SettingsClientPage user={user} />;
}
