
import { getScansForUser } from '@/lib/web-scans-store';
import { MonitoringClient } from './monitoring-client';

export default async function MonitoringPage() {
  const userId = "user_creator_123";
  const initialScanHistory = await getScansForUser(userId);

  return (
    <MonitoringClient initialHistory={initialScanHistory} />
  );
}
