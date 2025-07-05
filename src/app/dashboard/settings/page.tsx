
import SettingsClientPage from './settings-client-page';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  noStore();
  
  // This page now relies on the client-side useSession hook,
  // so we don't need to fetch data here. The client page
  // will handle its own data needs.
  
  return <SettingsClientPage />;
}
