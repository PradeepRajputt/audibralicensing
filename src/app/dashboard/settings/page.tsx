
import SettingsClientPage from './settings-client-page';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  noStore();
  
  // This page now relies on the client-side UserProvider,
  // so we don't need to fetch the user here. The client page
  // will handle its own data needs.
  
  return <SettingsClientPage />;
}
