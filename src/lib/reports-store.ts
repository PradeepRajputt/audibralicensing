
'use server';

import type { Report } from '@/lib/types';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db("creator-shield-db");
}

export async function getAllReports(): Promise<Report[]> {
    const db = await getDb();
    const reports = await db.collection('reports').find({}).sort({ submitted: -1 }).toArray();
    return reports.map(r => {
        const { _id, ...rest } = r;
        return { ...rest, id: _id.toString() } as unknown as Report;
    });
}

export async function getReportsForUser(creatorId: string): Promise<Report[]> {
    const db = await getDb();
    const reports = await db.collection('reports').find({ creatorId }).sort({ submitted: -1 }).toArray();
    return reports.map(r => {
        const { _id, ...rest } = r;
        return { ...rest, id: _id.toString() } as unknown as Report;
    });
}

export async function getReportById(id: string): Promise<Report | undefined> {
    if (!ObjectId.isValid(id)) return undefined;
    const db = await getDb();
    const report = await db.collection('reports').findOne({ _id: new ObjectId(id) });
    if (!report) return undefined;
    const { _id, ...rest } = report;
    return { ...rest, id: _id.toString() } as unknown as Report;
}

export async function createReport(data: Omit<Report, 'id' | 'submitted' | 'status'>): Promise<void> {
    const db = await getDb();
    const newReport = {
        ...data,
        status: 'in_review' as const,
        submitted: new Date().toISOString(),
    };
    await db.collection('reports').insertOne(newReport);
}

export async function updateReportStatus(reportId: string, status: 'approved' | 'rejected'): Promise<void> {
    if (!ObjectId.isValid(reportId)) return;
    const db = await getDb();
    await db.collection('reports').updateOne({ _id: new ObjectId(reportId) }, { $set: { status } });
}
