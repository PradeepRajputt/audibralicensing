
'use client';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import type { ManualReport } from '@/lib/firebase/types';

// This file now acts as a client-side wrapper for Firestore operations.
// The data is fetched from the server and this file just provides typed functions.

export type Report = {
  id: string;
  creatorName: string;
  platform: string;
  suspectUrl: string;
  reason: string;
  status: 'in_review' | 'approved' | 'rejected';
  submitted: string; // ISO date string
};

export async function getAllReports(): Promise<Report[]> {
  if (!db) {
      console.warn("Firestore is not initialized. Returning empty array.");
      return [];
  }
  const reportsRef = collection(db, "manualReports");
  const q = query(reportsRef);
  const querySnapshot = await getDocs(q);
  const reports: Report[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as Omit<ManualReport, 'reportId'> & { createdAt: Timestamp };
    reports.push({
      id: doc.id,
      creatorName: data.creatorId, // In a real app, you'd fetch the creator name
      platform: data.platform,
      suspectUrl: data.suspectURL,
      reason: data.reason,
      status: data.formStatus,
      submitted: data.createdAt.toDate().toISOString(),
    });
  });
  return reports.sort((a, b) => new Date(b.submitted).getTime() - new Date(a.submitted).getTime());
}


export async function getReportById(id: string): Promise<Report | undefined> {
    const allReports = await getAllReports();
    return allReports.find(report => report.id === id);
}


export async function updateReportStatus(reportId: string, status: 'approved' | 'rejected'): Promise<Report | undefined> {
    if (!db) {
        console.error("Firestore not configured, cannot update report.");
        return;
    }
    const reportRef = doc(db, "manualReports", reportId);
    await updateDoc(reportRef, {
        formStatus: status
    });
    return getReportById(reportId);
}
