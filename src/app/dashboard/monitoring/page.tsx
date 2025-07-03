
import { getScansForUser } from '@/lib/web-scans-store';
import { MonitoringClient } from './monitoring-client';
import type { WebScan } from '@/lib/types';

export default async function MonitoringPage() {
  const userId = "user_creator_123";
  const rawScanHistory = await getScansForUser(userId);
  const initialScanHistory = JSON.parse(JSON.stringify(rawScanHistory)) as WebScan[];


  return (
    <MonitoringClient initialHistory={initialScanHistory} />
  );
}
