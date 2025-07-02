
'use server';

import type { Report } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

let reports: Report[] = [
  {
    id: "report_initial_1",
    creatorId: "user_creator_123",
    creatorName: "Sample Creator",
    platform: "youtube",
    suspectUrl: "https://youtube.com/watch?v=fake123",
    originalContentTitle: "My Most Epic Adventure Yet!",
    originalContentUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    reason: "This is a direct reupload of my video.",
    status: "approved", // Changed from "action_taken" to "approved"
    submitted: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: "report_initial_2",
    creatorId: "user_creator_456",
    creatorName: "Alice Vlogs",
    platform: "instagram",
    suspectUrl: "https://instagram.com/p/reel456",
    originalContentTitle: "Baking Sourdough",
    originalContentUrl: "https://instagram.com/p/original_reel",
    reason: "They used my background music without credit.",
    status: "rejected",
    submitted: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString()
  },
  {
    id: "report_initial_3",
    creatorId: "user_creator_123",
    creatorName: "Sample Creator",
    platform: "web",
    suspectUrl: "https://thissiteisstealing.com/my-article",
    originalContentTitle: "My Travel Blog - Summer in Italy",
    originalContentUrl: "https://myblog.com/italy-summer",
    reason: "Copied my entire blog post word for word.",
    status: "in_review",
    submitted: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString()
  },
];


export async function getAllReports(): Promise<Report[]> {
    noStore();
    return JSON.parse(JSON.stringify(reports.sort((a, b) => new Date(b.submitted).getTime() - new Date(a.submitted).getTime())));
}

export async function getReportsForUser(creatorId: string): Promise<Report[]> {
    noStore();
    const userReports = reports.filter(r => r.creatorId === creatorId);
    return JSON.parse(JSON.stringify(userReports.sort((a, b) => new Date(b.submitted).getTime() - new Date(a.submitted).getTime())));
}

export async function getReportById(id: string): Promise<Report | undefined> {
    noStore();
    const report = reports.find(r => r.id === id);
    return report ? JSON.parse(JSON.stringify(report)) : undefined;
}

export async function createReport(data: Omit<Report, 'id' | 'submitted' | 'status'>): Promise<void> {
    noStore();
    const newReport: Report = {
        ...data,
        id: `report_${Date.now()}`,
        status: 'in_review' as const,
        submitted: new Date().toISOString(),
    };
    reports.unshift(newReport);
}

export async function updateReportStatus(reportId: string, status: 'approved' | 'rejected' | 'action_taken'): Promise<void> {
    noStore();
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex !== -1) {
        reports[reportIndex].status = status;
    }
}
