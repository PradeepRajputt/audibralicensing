
'use client';
import SettingsClientPage from './settings-client-page';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { loading } = useAuth();
  
  if (loading) {
     return <div className="flex items-center justify-center h-full py-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
  }

  return <SettingsClientPage />;
}
