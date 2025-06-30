
'use client';

import type { Report } from '@/lib/firebase/types';

const REPORTS_KEY = 'creator_shield_reports';

const initialReports: Report[] = [
    {
        id: 'report_initial_1',
        creatorName: 'Sample Creator',
        platform: 'youtube',
        suspectUrl: 'https://youtube.com/watch?v=fake123',
        reason: 'This is a direct reupload of my video.',
        status: 'approved',
        submitted: new Date(Date.now() - (1000 * 60 * 60 * 24 * 2)).toISOString(),
    },
    {
        id: 'report_initial_2',
        creatorName: 'Alice Vlogs',
        platform: 'instagram',
        suspectUrl: 'https://instagram.com/p/reel456',
        reason: 'They used my background music without credit.',
        status: 'rejected',
        submitted: new Date(Date.now() - (1000 * 60 * 60 * 24 * 7)).toISOString(),
    },
];

function getReportsFromStorage(): Report[] {
  if (typeof window === 'undefined') return initialReports;
  const stored = localStorage.getItem(REPORTS_KEY);
  if (!stored) {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(initialReports));
    return initialReports;
  }
  return JSON.parse(stored);
}

function saveReportsToStorage(reports: Report[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  window.dispatchEvent(new Event('storage'));
}


export function getAllReports(): Report[] {
    const reports = getReportsFromStorage();
    return reports.sort((a, b) => new Date(b.submitted).getTime() - new Date(a.submitted).getTime());
}

export function getReportById(id: string): Report | undefined {
    return getReportsFromStorage().find(report => report.id === id);
}

export function addReport(data: Omit<Report, 'id' | 'creatorName' | 'status' | 'submitted'>) {
    const reports = getReportsFromStorage();
    const newReport: Report = {
        ...data,
        id: `report_${Date.now()}`,
        creatorName: 'Sample Creator', // In a real app, get this from session
        status: 'in_review',
        submitted: new Date().toISOString(),
    };
    saveReportsToStorage([newReport, ...reports]);
}

export function updateReportStatus(reportId: string, status: 'approved' | 'rejected') {
    const reports = getReportsFromStorage();
    const updatedReports = reports.map(r => r.id === reportId ? { ...r, status } : r);
    saveReportsToStorage(updatedReports);
}
