
'use server';

import mongoose from 'mongoose';
import WebScan from '../models/WebScan';

export async function createWebScan(data: any) {
  try {
    await WebScan.create(data);
  } catch (err) {
    console.error('Error creating web scan:', err);
  }
}

export async function getScansForUser(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return [];
  try {
    const scans = await WebScan.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();
    return scans.map((s: any) => ({
      ...s,
      id: s._id?.toString?.() ?? s.id,
      userId: s.userId?.toString?.() ?? s.userId,
      timestamp: s.timestamp instanceof Date ? s.timestamp.toISOString() : s.timestamp,
    }));
  } catch (err) {
    console.error('Error fetching web scans:', err);
    return [];
  }
}
