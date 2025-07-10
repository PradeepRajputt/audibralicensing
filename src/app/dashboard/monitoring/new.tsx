import React from 'react';
import { useSearchParams } from 'next/navigation';
import { MonitoringClient } from './monitoring-client';
import { getScansForUser } from '@/lib/web-scans-store';
import type { WebScan } from '@/lib/types';

const MonitoringNewPage = async () => {
  // Get query params for auto-fill
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const url = searchParams?.get('url') || '';
  const title = searchParams?.get('title') || '';
  const publishedAt = searchParams?.get('publishedAt') || '';

  // Fetch initial scan history (reuse logic from main monitoring page)
  const userId = "user_creator_123";
  const rawScanHistory = await getScansForUser(userId);
  const initialScanHistory = JSON.parse(JSON.stringify(rawScanHistory)) as WebScan[];

  // Pass default values to MonitoringClient
  return (
    <MonitoringClient initialHistory={initialScanHistory} defaultUrl={url} defaultTitle={title} defaultPublishedAt={publishedAt} />
  );
};

export default MonitoringNewPage; 