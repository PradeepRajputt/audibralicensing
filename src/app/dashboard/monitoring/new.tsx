import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { MonitoringClient } from './monitoring-client';
import { getScansForUser } from '@/lib/web-scans-store';
import type { WebScan } from '@/lib/types';

const MonitoringNewPage = () => {
  const { data: session } = useSession();
  const [scanHistory, setScanHistory] = useState<WebScan[]>([]);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const url = searchParams?.get('url') || '';
  const title = searchParams?.get('title') || '';
  const publishedAt = searchParams?.get('publishedAt') || '';

  useEffect(() => {
    async function fetchScans() {
      if (session?.user?.email) {
        const res = await fetch(`/api/creator-by-email?email=${session.user.email}`);
        const user = await res.json();
        if (user?.id) {
          const scans = await getScansForUser(user.id);
          setScanHistory(scans);
        }
      }
    }
    fetchScans();
  }, [session]);

  return (
    <MonitoringClient initialHistory={scanHistory} defaultUrl={url} defaultTitle={title} defaultPublishedAt={publishedAt} />
  );
};

export default MonitoringNewPage; 