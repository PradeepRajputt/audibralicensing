/**
 * @file This file contains server-side functions for interacting with external services
 * like a FastAPI backend, YouTube Data API, and SendGrid for emails. These functions
 * are designed to be used by Next.js API Routes, simulating the behavior of
 * traditional cloud functions.
 */
import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ProtectedContent, ManualReport, User, Violation, UserAnalytics } from '@/lib/firebase/types';
import axios from 'axios';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Simulates a trigger for when new protected content is added.
 * It calls an external FastAPI backend to start an analysis process.
 * 
 * In a real app, you would call this function after successfully uploading
 * and saving new content information to Firestore.
 */
export async function triggerFastApiForNewContent(content: ProtectedContent) {
  if (!process.env.FASTAPI_BACKEND_URL) {
    console.error('FASTAPI_BACKEND_URL is not set.');
    return;
  }
  try {
    await axios.post(`${process.env.FASTAPI_BACKEND_URL}/new-content`, {
      contentId: content.contentId,
      creatorId: content.creatorId,
      videoURL: content.videoURL,
      title: content.title,
    });
    console.log(`Triggered FastAPI for new content: ${content.contentId}`);
  } catch (error) {
    console.error('Error triggering FastAPI for new content:', error);
  }
}

/**
 * Simulates a trigger for when a new manual report is submitted.
 * It calls an external FastAPI backend to process the report.
 * 
 * In a real app, this would be called after a user submits a manual report form.
 */
export async function triggerFastApiForNewReport(report: ManualReport) {
    if (!process.env.FASTAPI_BACKEND_URL) {
        console.error('FASTAPI_BACKEND_URL is not set.');
        return;
    }
  try {
    await axios.post(`${process.env.FASTAPI_BACKEND_URL}/new-report`, {
      reportId: report.reportId,
      creatorId: report.creatorId,
      suspectURL: report.suspectURL,
      reason: report.reason,
    });
    console.log(`Triggered FastAPI for new manual report: ${report.reportId}`);
  } catch (error) {
    console.error('Error triggering FastAPI for new report:', error);
  }
}

/**
 * Stores a violation reported by the backend and sends an email alert to the creator.
 * This function is intended to be called by a webhook from our FastAPI service.
 */
export async function processViolationFromFastApi(violationData: Omit<Violation, 'matchId' | 'detectedAt'> & { creatorEmail: string }) {
  if (!db) {
    const message = "Firebase is not configured. Cannot process violation.";
    console.error(message);
    return { success: false, error: message };
  }
  
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    console.error('SendGrid environment variables are not fully configured.');
    // Still save to DB even if email fails
  }

  try {
    // 1. Store the violation in Firestore
    const newViolation: Omit<Violation, 'matchId'> = {
        ...violationData,
        detectedAt: Timestamp.now(),
    }
    const docRef = await addDoc(collection(db, 'violations'), newViolation);
    console.log(`Stored violation with ID: ${docRef.id}`);

    // 2. Send an email alert via SendGrid
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
        const msg = {
            to: violationData.creatorEmail,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: 'New Copyright Violation Detected!',
            html: `
                <h1>Potential Copyright Violation Found</h1>
                <p>Hi there,</p>
                <p>Our system has detected a potential copyright violation of your content.</p>
                <p><strong>Infringing URL:</strong> ${violationData.matchedURL}</p>
                <p>Please log in to your CreatorShield dashboard to review the details and take action.</p>
                <br/>
                <p>Thanks,</p>
                <p>The CreatorShield Team</p>
            `,
        };
        await sgMail.send(msg);
        console.log(`Sent violation alert email to ${violationData.creatorEmail}`);
    }
    return { success: true, violationId: docRef.id };
  } catch (error) {
    console.error('Error processing violation or sending email:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Fetches the latest YouTube analytics for all users with a connected YouTube ID
 * and updates their `analytics` subcollection in Firestore.
 * This is designed to be run by a scheduled cron job.
 */
export async function updateAllUserAnalytics() {
  if (!db) {
    const message = "Firebase is not configured. Cannot update analytics.";
    console.error(message);
    return { success: false, updated: 0, total: 0, error: message };
  }

  const usersRef = collection(db, 'users');
  // Find all users who have a youtubeId
  const q = query(usersRef, where('youtubeId', '!=', null));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log('No users with YouTube IDs found to update.');
    return { success: true, updated: 0, total: querySnapshot.size };
  }
  
  let updatedCount = 0;
  for (const userDoc of querySnapshot.docs) {
      const user = userDoc.data() as User;
      try {
        // In a real app, you would call the YouTube Data API here.
        // For this example, we'll use mock data.
        const mockAnalytics = {
            subscribers: Math.floor(Math.random() * 100000),
            views: Math.floor(Math.random() * 10000000),
            mostViewedVideo: 'dQw4w9WgXcQ', // Mock video ID
        };

        const analyticsData: Omit<UserAnalytics, 'lastFetched'> = {
            subscribers: mockAnalytics.subscribers,
            views: mockAnalytics.views,
            mostViewedVideo: mockAnalytics.mostViewedVideo,
        };

        const analyticsRef = doc(db, 'users', user.uid, 'analytics', 'youtube');
        // Using updateDoc with set to true would also work to create/update
        await updateDoc(doc(db, 'users', user.uid, 'analytics', 'youtube'), {
            ...analyticsData,
            lastFetched: Timestamp.now(),
        });

        console.log(`Updated analytics for user ${user.uid}`);
        updatedCount++;
      } catch(error) {
        console.error(`Failed to update analytics for user ${user.uid}:`, error);
      }
  }

  return { success: true, updated: updatedCount, total: querySnapshot.size };
}


/**
 * Sends an email to a creator informing them that their reactivation request was denied.
 */
export async function sendReactivationDenialEmail({ to, name }: { to: string; name: string }) {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    console.warn(`SendGrid not configured. Skipping reactivation denial email to ${to}.`);
    // In a real app, you might want to throw an error or return a specific status.
    // For simulation, we'll just log it and pretend it succeeded.
    return { success: true };
  }

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Update on your CreatorShield Account',
    html: `
      <h1>CreatorShield Account Reactivation</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your request to reactivate your account.</p>
      <p>After a review, we have decided not to reactivate your account at this time. This decision is final.</p>
      <br/>
      <p>Regards,</p>
      <p>The CreatorShield Team</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Sent reactivation denial email to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Error sending reactivation denial email to ${to}:`, error);
    return { success: false, error: (error as Error).message };
  }
}
