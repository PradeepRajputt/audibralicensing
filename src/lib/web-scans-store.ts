
'use server';

import type { WebScan } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

let mockWebScans: WebScan[] = [
    {
        id: 'scan_1',
        userId: 'user_creator_123',
        pageUrl: 'https://random-blog.com/my-article-repost',
        scanType: 'text',
        status: 'completed',
        matchFound: true,
        matchScore: 0.88,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'scan_2',
        userId: 'user_creator_123',
        pageUrl: 'https://another-site.com/gallery',
        scanType: 'image',
        status: 'completed',
        matchFound: false,
        matchScore: 0.12,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
];

export async function getScansForUser(userId: string): Promise<WebScan[]> {
    noStore();
    console.log(`MOCK: Fetching scans for user ${userId}`);
    return Promise.resolve(
        mockWebScans.filter(s => s.userId === userId)
                    .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
    );
}

export async function addScan(data: Omit<WebScan, 'id' | 'timestamp'>): Promise<WebScan> {
    noStore();
    const newScan: WebScan = {
        ...data,
        id: `scan_${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    mockWebScans.unshift(newScan);
    if (mockWebScans.length > 20) { // Keep the mock list from growing too large
        mockWebScans.pop();
    }
    console.log("MOCK: Added new web scan", newScan);
    return Promise.resolve(newScan);
}
