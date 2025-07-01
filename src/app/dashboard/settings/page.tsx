import SettingsClientPage from './settings-client-page';
import { getUserById } from '@/lib/users-store';
import type { User } from '@/lib/types';

export default async function SettingsPage() {
  // In a real app, you'd get this from the session
  const userId = 'user_creator_123';
  const user = await getUserById(userId);

  return <SettingsClientPage user={user} />;
}
