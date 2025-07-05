
'use client';
import SettingsClientPage from './settings-client-page';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  // The useAuth hook and loading state have been removed as authentication is no longer part of the app.
  return <SettingsClientPage />;
}
