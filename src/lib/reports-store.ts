'use server';

import { unstable_noStore as noStore } from 'next/cache';
import mongoose from 'mongoose';
import ReportModel from '../models/Report';

// Define the Report interface (you can extend this if needed)
export interface Report {
  _id: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  submitted: string;
  status: 'in_review' | 'approved' | 'rejected' | 'action_taken';
  [key: string]: any;
}

// Utility: Ensure DB is connected (optional - if you don’t use persistent connection)
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI as string);
  }
}

// ✅ Get all reports
export async function getAllReports(): Promise<Report[]> {
  noStore();
  try {
    await connectDB();
    const reports = await ReportModel.find({}).sort({ submitted: -1 }).lean().exec();
    return reports.map((r: any) => ({
      ...r,
      id: r._id?.toString?.() ?? r.id,
      creatorId: r.creatorId,
      submitted: r.submitted,
      status: r.status,
      // ...add any other required fields with fallback/defaults if needed
    })) as Report[];
  } catch (err) {
    console.error('Error fetching all reports:', err);
    return [];
  }
}

// ✅ Get reports by creatorId
export async function getReportsForUser(creatorId: string): Promise<Report[]> {
  noStore();
  if (!mongoose.Types.ObjectId.isValid(creatorId)) {
    return [];
  }
  try {
    await connectDB();
    const reports = await ReportModel.find({ creatorId: new mongoose.Types.ObjectId(creatorId) })
      .sort({ submitted: -1 })
      .lean()
      .exec();
    return reports.map((r: any) => ({
      ...r,
      id: r._id?.toString?.() ?? r.id,
      creatorId: r.creatorId,
      submitted: r.submitted,
      status: r.status,
    })) as Report[];
  } catch (err) {
    console.error('Error fetching reports for user:', err);
    return [];
  }
}

// ✅ Get single report by ID
export async function getReportById(id: string): Promise<Report | undefined> {
  noStore();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return undefined;
  }
  try {
    await connectDB();
    const report = await ReportModel.findById(id).lean().exec();
    if (!report) return undefined;
    return {
      ...report,
      id: (report as any)._id?.toString?.() ?? (report as any).id,
      creatorId: (report as any).creatorId,
      submitted: (report as any).submitted,
      status: (report as any).status,
    } as Report;
  } catch (err) {
    console.error('Error fetching report by id:', err);
    return undefined;
  }
}

// ✅ Create a new report
export async function createReport(data: Partial<Report>): Promise<void> {
  noStore();
  try {
    await connectDB();
    await ReportModel.create({
      ...data,
      submitted: new Date().toISOString(),
      status: 'in_review',
    });
  } catch (err) {
    console.error('Error creating report:', err);
  }
}

// ✅ Update report status
export async function updateReportStatus(
  reportId: string,
  status: 'approved' | 'rejected' | 'action_taken'
): Promise<void> {
  noStore();
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    return;
  }
  try {
    await connectDB();
    await ReportModel.updateOne({ _id: reportId }, { $set: { status } }).exec();
  } catch (err) {
    console.error('Error updating report status:', err);
  }
}
