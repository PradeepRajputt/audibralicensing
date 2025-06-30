
/**
 * Represents a user in the `users` collection.
 * Path: /users/{uid}
 */
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  role: 'creator' | 'admin';
  joinDate: string; // Using ISO string for client-side
  platformsConnected: ('youtube' | 'instagram' | 'tiktok')[];
  youtubeId?: string;
  status: 'active' | 'suspended' | 'deactivated';
}

/**
 * Represents a user's analytics data in the `analytics` subcollection.
 * Path: /users/{uid}/analytics/{docId}
 */
export interface UserAnalytics {
  subscribers: number;
  views: number;
  mostViewedVideo: string; // video ID or URL
  lastFetched: string; // Using ISO string for client-side
}

/**
 * Represents a piece of protected content in the `protectedContent` collection.
 * Path: /protectedContent/{contentId}
 */
export interface ProtectedContent {
  contentId: string;
  creatorId: User['uid'];
  contentType: 'video' | 'audio' | 'text' | 'image';
  videoURL?: string;
  title: string;
  tags: string[];
  platform: 'youtube' | 'vimeo' | 'web';
  uploadDate: string; // Using ISO string for client-side
}

/**
 * Represents a detected copyright violation in the `violations` collection.
 * Path: /violations/{matchId}
 */
export interface Violation {
  matchId: string;
  creatorId: User['uid'];
  matchedURL: string;
  platform: 'youtube' | 'web' | 'instagram' | 'tiktok';
  matchScore: number; // e.g., 0.95 for 95% match
  detectedAt: string; // Using ISO string for client-side
  status: 'pending_review' | 'action_taken' | 'dismissed';
}

/**
 * Represents a manual report submitted by a creator in the `manualReports` collection.
 * Path: /manualReports/{reportId}
 */
export interface ManualReport {
  reportId: string;
  creatorId: User['uid'];
  platform: string;
  suspectURL: string;
  reason: string;
  evidenceLink?: string;
  formStatus: 'submitted' | 'in_review' | 'resolved' | 'rejected';
  createdAt: string; // Using ISO string for client-side
}

/**
 * Represents an action taken by an admin in the `adminActions` collection.
 * Path: /adminActions/{actionId}
 */
export interface AdminAction {
  actionId: string;
  reportId: ManualReport['reportId'] | Violation['matchId'];
  adminId: User['uid'];
  status: 'warning_sent' | 'takedown_issued' | 'resolved' | 'escalated';
  warningSent: boolean;
  deadline?: string; // Using ISO string for client-side
  resolutionDate: string; // Using ISO string for client-side
  notes?: string;
}
