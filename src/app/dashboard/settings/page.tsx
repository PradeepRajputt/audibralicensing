
import SettingsClientPage from './settings-client-page';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  noStore();
  return <SettingsClientPage />;
}
