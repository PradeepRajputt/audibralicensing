'use server';

import { z } from 'zod';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { triggerFastApiForNewReport } from '@/lib/services/backend-services';
import type { ManualReport } from '@/lib/firebase/types';

// Let's assume we have a way to get the current user's ID.
// For now, we'll mock it.
const MOCK_CREATOR_ID = 'user_creator_123';

const formSchema = z.object({
  platform: z.string(),
  suspectUrl: z.string().url(),
  reason: z.string().min(10),
});

export async function submitManualReportAction(values: z.infer<typeof formSchema>) {
  try {
    const newReportData: Omit<ManualReport, 'reportId'> = {
      creatorId: MOCK_CREATOR_ID,
      platform: values.platform,
      suspectURL: values.suspectUrl,
      reason: values.reason,
      formStatus: 'submitted',
      createdAt: Timestamp.now(),
    };

    // 1. Save the manual report to Firestore
    const docRef = await addDoc(collection(db, 'manualReports'), newReportData);
    console.log(`Manual report saved with ID: ${docRef.id}`);

    // 2. Trigger the FastAPI backend for analysis
    const fullReport: ManualReport = {
      ...newReportData,
      reportId: docRef.id,
    };
    await triggerFastApiForNewReport(fullReport);

    return { success: true, message: 'Report submitted and sent for analysis.' };
  } catch (error) {
    console.error('Error submitting manual report:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred. Please try again.' };
  }
}
