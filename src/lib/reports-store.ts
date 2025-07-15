'use server';

import { unstable_noStore as noStore } from 'next/cache';
import mongoose from 'mongoose';
import ReportModel from '../models/Report';
import Strike from '../models/Strike';
import Creator from '../models/Creator';

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
      _id: r._id?.toString?.() ?? r.id,
      creatorId: r.creatorId?.toString?.() ?? r.creatorId,
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
      _id: r._id?.toString?.() ?? r.id,
      creatorId: r.creatorId?.toString?.() ?? r.creatorId,
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
      _id: (report as any)._id?.toString?.() ?? (report as any).id,
      creatorId: (report as any).creatorId?.toString?.() ?? (report as any).creatorId,
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
    await ReportModel.findOneAndUpdate(
      { creatorId: data.creatorId },
      {
        $push: {
          reports: {
            platform: data.platform,
            status: 'in_review',
            reason: data.reason,
            submitted: new Date().toISOString(),
            originalContentUrl: data.originalContentUrl,
            suspectUrl: data.suspectUrl,
            // add any other fields you want to store in a single report
          }
        }
      },
      { upsert: true, new: true }
    );
    // --- Add a strike for this creator as well ---
    await Strike.findOneAndUpdate(
      { creatorId: data.creatorId },
      {
        $push: {
          strikes: {
            status: 'pending',
            reason: data.reason,
            createdAt: new Date(),
            platform: data.platform,
            suspectUrl: data.suspectUrl,
            originalContentUrl: data.originalContentUrl,
            originalContentTitle: data.originalContentTitle,
            creatorName: data.creatorName,
            creatorAvatar: data.creatorAvatar,
          }
        }
      },
      { upsert: true, new: true }
    );
    // --- End strike logic ---
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

// ✅ Get all strikes (flattened for admin rendering)
export async function getAllStrikesForAdmin() {
  noStore();
  try {
    await connectDB();
    const strikeDocs = await Strike.find({}).lean().exec();
    // Get all unique creatorIds
    const creatorIds = strikeDocs.map(doc => doc.creatorId?.toString()).filter(Boolean);
    const creators = await Creator.find({ _id: { $in: creatorIds } }).lean().exec();
    const creatorMap = {};
    creators.forEach(c => {
      creatorMap[c._id.toString()] = {
        name: c.displayName || c.name || 'Unknown Creator',
        avatar: c.avatar || '',
      };
    });
    // Flatten all strikes for admin table
    const allStrikes = strikeDocs.flatMap((doc: any) =>
      (doc.strikes || []).map((strike: any) => {
        const { _id, ...rest } = strike;
        const creatorInfo = creatorMap[doc.creatorId?.toString()] || {};
        return {
          ...rest,
          id: _id?.toString?.() ?? undefined,
          creatorId: doc.creatorId?.toString?.() ?? undefined,
          creatorName: rest.creatorName || creatorInfo.name || 'Unknown Creator',
          creatorAvatar: rest.creatorAvatar || creatorInfo.avatar || '',
          submitted: strike.createdAt ? new Date(strike.createdAt).toISOString() : '',
        };
      })
    );
    return allStrikes;
  } catch (err) {
    console.error('Error fetching all strikes:', err);
    return [];
  }
}

export async function getStrikeById(strikeId) {
  noStore();
  try {
    await connectDB();
    const doc = await Strike.findOne({ 'strikes._id': strikeId }).lean().exec();
    if (!doc) return undefined;
    const strike = (doc.strikes || []).find(s => s._id.toString() === strikeId);
    if (!strike) return undefined;
    // Deep sanitize: remove _id object, convert to string, ensure all fields are plain
    const { _id, ...rest } = strike;
    return {
      ...rest,
      id: _id?.toString?.() ?? undefined,
      creatorId: doc.creatorId.toString(),
    };
  } catch (err) {
    console.error('Error fetching strike by id:', err);
    return undefined;
  }
}
