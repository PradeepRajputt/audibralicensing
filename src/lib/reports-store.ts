
'use client';

// A mock "database" using localStorage to simulate state between creator and admin views.

const REPORTS_KEY = 'creator_shield_reports';

export type Report = {
  id: string;
  creatorName: string;
  platform: string;
  suspectUrl: string;
  reason: string;
  status: 'in_review' | 'approved' | 'rejected';
  submitted: string; // ISO date string
};

function getReportsFromStorage(): Report[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const reportsJSON = localStorage.getItem(REPORTS_KEY);
  // Initialize with some data if it's the first time
  if (!reportsJSON) {
    const initialData: Report[] = [
        { 
            id: "report_initial_1",
            creatorName: "Sample Creator",
            suspectUrl: "https://youtube.com/watch?v=fake123",
            platform: "YouTube",
            status: "approved",
            submitted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            reason: "This is a direct reupload of my video.",
        },
        { 
            id: "report_initial_2",
            creatorName: "Alice Vlogs",
            suspectUrl: "https://instagram.com/p/reel456",
            platform: "Instagram",
            status: "rejected",
            submitted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
            reason: "They used my background music without credit.",
        },
    ];
    localStorage.setItem(REPORTS_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(reportsJSON);
}

function saveReportsToStorage(reports: Report[]) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  // Dispatch a storage event to notify other tabs/windows
  window.dispatchEvent(new Event('storage'));
}

// ---- Public API ----

export function getAllReports(): Report[] {
  return getReportsFromStorage();
}

export function getPendingStrikeRequests(): Report[] {
  const allReports = getReportsFromStorage();
  // For the admin, we only show pending reports.
  return allReports.filter(report => report.status === 'in_review');
}

export function addReport(data: { platform: string; suspectUrl: string; reason: string }): Report {
  const allReports = getReportsFromStorage();
  const newReport: Report = {
    ...data,
    id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    creatorName: 'Sample Creator', // Mocked for simplicity
    status: 'in_review',
    submitted: new Date().toISOString(),
  };
  const updatedReports = [newReport, ...allReports];
  saveReportsToStorage(updatedReports);
  return newReport;
}

export function updateReportStatus(reportId: string, status: 'approved' | 'rejected'): Report | undefined {
  const allReports = getReportsFromStorage();
  let updatedReport;
  const updatedReports = allReports.map(report => {
    if (report.id === reportId) {
      updatedReport = { ...report, status };
      return updatedReport;
    }
    return report;
  });
  saveReportsToStorage(updatedReports);
  return updatedReport;
}
