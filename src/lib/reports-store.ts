
'use server';

import type { Report } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';

async function getReportsCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<Report>('reports');
}


export async function getAllReports(): Promise<Report[]> {
    noStore();
    const collection = await getReportsCollection();
    const reports = await collection.find({}, { projection: { _id: 0 } }).sort({ submitted: -1 }).toArray();
    return reports as Report[];
}

export async function getReportsForUser(creatorId: string): Promise<Report[]> {
    noStore();
    const collection = await getReportsCollection();
    const reports = await collection.find({ creatorId }, { projection: { _id: 0 } }).sort({ submitted: -1 }).toArray();
    return reports as Report[];
}

export async function getReportById(id: string): Promise<Report | undefined> {
    noStore();
    const collection = await getReportsCollection();
    const report = await collection.findOne({ id: id }, { projection: { _id: 0 } });
    return report as Report | undefined;
}

export async function createReport(data: Omit<Report, 'id' | 'submitted' | 'status'>): Promise<void> {
    noStore();
    const collection = await getReportsCollection();
    const newReport: Report = {
        ...data,
        id: `report_${Date.now()}`,
        status: 'in_review' as const,
        submitted: new Date().toISOString(),
    };
    await collection.insertOne(newReport);
}

export async function updateReportStatus(reportId: string, status: 'approved' | 'rejected' | 'action_taken'): Promise<void> {
    noStore();
    const collection = await getReportsCollection();
    const result = await collection.updateOne({ id: reportId }, { $set: { status } });
     if (result.matchedCount === 0) {
        throw new Error('Report not found');
    }
}
