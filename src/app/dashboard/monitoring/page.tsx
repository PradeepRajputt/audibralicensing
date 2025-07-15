"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getScansForUser } from '@/lib/web-scans-store';
import { MonitoringClient } from './monitoring-client';
import type { WebScan } from '@/lib/types';

export default function MonitoringPage() {
  const { data: session } = useSession();
  const [scanHistory, setScanHistory] = useState<WebScan[]>([]);
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
  return <MonitoringClient initialHistory={scanHistory} />;
}
