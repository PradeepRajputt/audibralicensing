
'use server';

import type { Report } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

const mockReports: Report[] = [
    { id: 'report_initial_1', creatorId: 'user_creator_123', creatorName: 'Sample Creator', suspectUrl: 'https://youtube.com/watch?v=fake123', platform: 'youtube', status: 'approved', submitted: new Date(Date.now() - 172800000).toISOString(), reason: 'This is a direct reupload of my video.', originalContentUrl: 'https://youtube.com/watch?v=original123', originalContentTitle: 'My Most Epic Adventure Yet!' },
    { id: 'report_initial_2', creatorId: 'user_creator_123', creatorName: 'Sample Creator', suspectUrl: 'https://instagram.com/p/reel456', platform: 'instagram', status: 'rejected', submitted: new Date(Date.now() - 604800000).toISOString(), reason: 'They used my background music without credit.', originalContentUrl: 'https://youtube.com/watch?v=original456', originalContentTitle: 'My Travel Blog - Summer in Italy' }
];

export async function getAllReports(): Promise<Report[]> {
    noStore();
    return Promise.resolve(mockReports);
}

export async function getReportsForUser(creatorId: string): Promise<Report[]> {
    noStore();
    return Promise.resolve(mockReports.filter(r => r.creatorId === creatorId));
}

export async function getReportById(id: string): Promise<Report | undefined> {
    noStore();
    return Promise.resolve(mockReports.find(r => r.id === id));
}

export async function createReport(data: Omit<Report, 'id' | 'submitted' | 'status'>): Promise<void> {
    noStore();
    console.log("MOCK: Creating new report", data);
}

export async function updateReportStatus(reportId: string, status: 'approved' | 'rejected' | 'action_taken'): Promise<void> {
    noStore();
    console.log(`MOCK: Updating report ${reportId} to status ${status}`);
    const report = mockReports.find(r => r.id === reportId);
    if (report) {
        report.status = status;
    }
}
