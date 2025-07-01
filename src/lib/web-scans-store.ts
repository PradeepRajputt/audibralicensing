
'use server';

import type { WebScan } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// In-memory array to store web scans
let webScans: WebScan[] = [];

export async function getScansForUser(userId: string): Promise<WebScan[]> {
    noStore();
    const userScans = webScans.filter(scan => scan.userId === userId);
    return JSON.parse(JSON.stringify(userScans.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)));
}

export async function addScan(data: Omit<WebScan, 'id' | 'timestamp'>): Promise<WebScan> {
    noStore();
    const newScan: WebScan = {
        ...data,
        id: `scan_${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    webScans.unshift(newScan);
    // Keep only the last 50 scans in memory for performance
    if (webScans.length > 50) {
        webScans.length = 50;
    }
    return JSON.parse(JSON.stringify(newScan));
}
