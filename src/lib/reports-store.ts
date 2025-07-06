
'use server';

import type { Report } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// Mock in-memory database for reports
let mockReports: Report[] = [
    { 
        id: 'report_newly_submitted_123', 
        creatorId: 'user_creator_123', 
        creatorName: 'Sample Creator', 
        creatorAvatar: 'https://placehold.co/128x128.png', 
        suspectUrl: 'https://stolen-blog.com/my-adventure-post', 
        platform: 'web', 
        status: 'in_review',
        submitted: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        reason: 'This is a direct copy of my article. They have stolen the entire text and are claiming it as their own.', 
        originalContentUrl: 'https://myblog.com/summer-in-italy', 
        originalContentTitle: 'My Travel Blog - Summer in Italy' 
    },
    { id: 'report_initial_1', creatorId: 'user_creator_123', creatorName: 'Sample Creator', creatorAvatar: 'https://placehold.co/128x128.png', suspectUrl: 'https://youtube.com/watch?v=fake123', platform: 'youtube', status: 'approved', submitted: new Date(Date.now() - 172800000).toISOString(), reason: 'This is a direct reupload of my video.', originalContentUrl: 'https://youtube.com/watch?v=original123', originalContentTitle: 'My Most Epic Adventure Yet!' },
    { id: 'report_initial_2', creatorId: 'user_creator_123', creatorName: 'Sample Creator', creatorAvatar: 'https://placehold.co/128x128.png', suspectUrl: 'https://instagram.com/p/reel456', platform: 'instagram', status: 'rejected', submitted: new Date(Date.now() - 6048e5).toISOString(), reason: 'They used my background music without credit.', originalContentUrl: 'https://youtube.com/watch?v=original456', originalContentTitle: 'My Travel Blog - Summer in Italy' }
];

export async function getAllReports(): Promise<Report[]> {
    noStore();
    // In a real app: await db.collection('reports').find().sort({ submitted: -1 }).toArray();
    return Promise.resolve(mockReports.sort((a,b) => new Date(b.submitted).getTime() - new Date(a.submitted).getTime()));
}

export async function getReportsForUser(creatorId: string): Promise<Report[]> {
    noStore();
     // In a real app: await db.collection('reports').find({ creatorId }).sort({ submitted: -1 }).toArray();
    return Promise.resolve(mockReports.filter(r => r.creatorId === creatorId).sort((a,b) => new Date(b.submitted).getTime() - new Date(a.submitted).getTime()));
}

export async function getReportById(id: string): Promise<Report | undefined> {
    noStore();
    // In a real app: await db.collection('reports').findOne({ id });
    return Promise.resolve(mockReports.find(r => r.id === id));
}

export async function createReport(data: Omit<Report, 'id' | 'submitted' | 'status'>): Promise<void> {
    noStore();
    const newReport: Report = {
        ...data,
        id: `report_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
        submitted: new Date().toISOString(),
        status: 'in_review',
    };
    // In a real app: await db.collection('reports').insertOne(newReport);
    mockReports.unshift(newReport);
    console.log("MOCK: Creating new report", newReport);
}

export async function updateReportStatus(reportId: string, status: 'approved' | 'rejected' | 'action_taken'): Promise<void> {
    noStore();
     // In a real app: await db.collection('reports').updateOne({ id: reportId }, { $set: { status } });
    console.log(`MOCK: Updating report ${reportId} to status ${status}`);
    const report = mockReports.find(r => r.id === reportId);
    if (report) {
        report.status = status;
    }
}
