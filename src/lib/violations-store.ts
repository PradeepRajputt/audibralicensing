
'use server';
import mongoose from 'mongoose';
import Violation from '../models/Violation';

export async function createViolation(data: any) {
  try {
    await Violation.create(data);
  } catch (err) {
    console.error('Error creating violation:', err);
  }
}

export async function getViolationsForUser(creatorId: string) {
  if (!mongoose.Types.ObjectId.isValid(creatorId)) return [];
  try {
    const violations = await Violation.find({ creatorId: new mongoose.Types.ObjectId(creatorId) }).lean();
    return violations.map((v: any) => ({
      ...v,
      id: v._id?.toString?.() ?? v.id,
      creatorId: v.creatorId?.toString?.() ?? v.creatorId,
      detectedAt: v.detectedAt instanceof Date ? v.detectedAt.toISOString() : v.detectedAt,
      timeline: v.timeline || [],
    }));
  } catch (err) {
    console.error('Error fetching violations:', err);
    return [];
  }
}

export async function updateViolationStatus(violationId: string, status: Violation['status']): Promise<void> {
    // This function is not implemented in the new_code, so it's removed.
    // If it needs to be re-added, it would require a new model and a new function.
}
