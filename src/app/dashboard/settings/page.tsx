
import SettingsClientPage from './settings-client-page';
import { getUserById } from '@/lib/users-store';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  noStore();
  // In a real app, you'd get this from the session. 
  // However, with client-side auth state, we can't do that here on the server easily.
  // The client component will use the useAuth hook to get the logged-in user.
  // This server fetch is now just a placeholder for potential future server-side props.
  const user = undefined;

  return <SettingsClientPage initialUser={user} />;
}
