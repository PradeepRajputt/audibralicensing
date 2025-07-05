
export interface User {
  id: string; 
  displayName: string | null;
  email: string;
  role: 'creator' | 'admin';
  joinDate: string; 
  platformsConnected: ('youtube' | 'instagram' | 'tiktok' | 'web')[];
  youtubeChannelId?: string;
  status: 'active' | 'suspended' | 'deactivated';
  avatar?: string;
  legalFullName?: string;
  address?: string;
  phone?: string;
}

/**
 * Represents a user's analytics data.
 */
export interface UserAnalytics {
  subscribers: number;
  views: number;
  mostViewedVideo: {
    title: string;
    views: number | string;
  };
  dailyData: {
    date: string;
    views: number;
    subscribers: number;
  }[];
}

/**
 * Represents a piece of protected content.
 */
export interface ProtectedContent {
  id: string;
  creatorId: string; // This will hold the User's ID
  contentType: 'video' | 'audio' | 'text' | 'image';
  videoURL?: string; // Should be renamed to contentURL
  title: string;
  tags: string[];
  platform: 'youtube' | 'vimeo' | 'web';
  uploadDate: string; // Using ISO string for client-side
  status: 'active' | 'inactive';
  lastChecked: string;
}


/**
 * Represents a detected copyright violation.
 */
export interface Violation {
  id: string;
  creatorId: string;
  originalContentTitle: string;
  originalContentUrl: string;
  infringingContentSnippet: string;
  matchedURL: string;
  platform: 'youtube' | 'web' | 'instagram' | 'tiktok';
  matchScore: number; 
  detectedAt: string; // ISO date string
  status: 'pending_review' | 'action_taken' | 'dismissed';
  timeline: { status: string; date: string }[];
}


/**
 * Represents a manual report submitted by a creator.
 */
export interface Report {
  id: string;
  creatorId: string;
  creatorName: string; // denormalized for simplicity
  platform: string;
  suspectUrl: string;
  originalContentUrl: string;
  originalContentTitle: string;
  reason: string;
  status: 'in_review' | 'approved' | 'rejected' | 'action_taken';
  submitted: string; // ISO date string
}

/**
 * Represents a reactivation request from a creator.
 */
export interface ReactivationRequest {
  creatorId: string;
  displayName: string;
  email: string;
  avatar: string;
  requestDate: string; // ISO Date string
};

/**
 * Represents a record of a web scan attempt.
 */
export interface WebScan {
  id: string;
  userId: string;
  pageUrl: string;
  scanType: 'text' | 'image' | 'video';
  status: 'completed' | 'failed';
  matchFound: boolean;
  matchScore?: number;
  timestamp: string; // ISO date string
}

export interface FeedbackReply {
  replyId: string;
  adminName: string; // 'Admin' for now
  message: string;
  mediaUrl?: string; // URL for image/video attachment
  timestamp: string;
}

export interface Feedback {
  feedbackId: string;
  creatorId: string;
  creatorName: string; // Denormalized for easy display
  avatar: string;
  rating: number;
  title: string;
  tags: string[];
  description: string;
  message?: string; // Optional message to admin
  response: FeedbackReply[];
  isReadByCreator: boolean;
  timestamp: string;
}


export type DashboardData = {
  analytics: UserAnalytics | null;
  activity: any[];
  user: User | undefined;
} | null;
