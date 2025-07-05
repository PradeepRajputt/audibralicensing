
/**
 * @file This file contains server-side functions for interacting with external services
 * like a FastAPI backend, YouTube Data API, and Resend for emails.
 */
'use server';

import { createViolation } from '@/lib/violations-store';
import type { Violation } from '@/lib/types';
import { Resend } from 'resend';

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = 'CreatorShield <onboarding@resend.dev>'; // This would be your verified domain

/**
 * Stores a violation reported by the backend and sends an email alert to the creator.
 * This function is intended to be called by a webhook from our FastAPI service.
 */
export async function processViolationFromFastApi(violationData: Omit<Violation, 'id' | 'detectedAt'> & { creatorEmail: string }) {
  if (!resend) {
    console.warn('Resend API key is not configured. Email will not be sent, but violation will be stored.');
  }

  try {
    const newViolation = await createViolation({
      creatorId: violationData.creatorId,
      matchedURL: violationData.matchedURL,
      platform: violationData.platform,
      matchScore: violationData.matchScore,
      status: violationData.status,
      originalContentUrl: "http://example.com/original", 
      originalContentTitle: "Sample Original Work", 
      infringingContentSnippet: "A snippet of the infringing content...",
      timeline: [], 
    });
    console.log(`Stored violation with ID: ${newViolation.id}`);

    if (resend) {
        await resend.emails.send({
            from: fromEmail,
            to: violationData.creatorEmail,
            subject: 'New Potential Copyright Violation Detected',
            html: `<p>Hi,</p><p>CreatorShield found a potential violation of your content at ${violationData.matchedURL}. Please log in to your dashboard to review.</p>`
        });
        console.log(`Sent violation alert email to ${violationData.creatorEmail}`);
    }
    
    return { success: true, violationId: newViolation.id };
  } catch (error) {
    console.error('Error processing violation or sending email:', error);
    return { success: false, error: (error as Error).message };
  }
}


export async function updateAllUserAnalytics() {
  console.log('Skipping analytics update: No database connected.');
  return { success: true, updated: 0, total: 0 };
}

export async function sendReactivationApprovalEmail({ to, name }: { to: string; name:string }) {
  if (!resend) {
    console.warn(`SIMULATING: Sending reactivation approval email to ${to}. RESEND_API_KEY not configured.`);
    return { success: true, simulated: true };
  }
  try {
    await resend.emails.send({
        from: fromEmail,
        to: to,
        subject: 'Your CreatorShield Account has been Reactivated',
        html: `<p>Hi ${name},</p><p>Your account has been reactivated. You can now log in.</p>`,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send reactivation approval email:", error);
    return { success: false, message: "Could not send email." };
  }
}

export async function sendReactivationDenialEmail({ to, name }: { to: string; name: string }) {
 if (!resend) {
    console.warn(`SIMULATING: Sending reactivation denial email to ${to}. RESEND_API_KEY not configured.`);
    return { success: true, simulated: true };
  }
  try {
    await resend.emails.send({
        from: fromEmail,
        to: to,
        subject: 'Update on Your CreatorShield Account Reactivation Request',
        html: `<p>Hi ${name},</p><p>We've reviewed your request for account reactivation and have decided not to proceed at this time. Thank you for your understanding.</p>`,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send reactivation denial email:", error);
    return { success: false, message: "Could not send email." };
  }
}

export async function sendTakedownConfirmationEmail(data: {
  to: string;
  creatorName: string;
  infringingUrl: string;
  originalUrl: string;
}) {
  if (!resend) {
    console.warn(`SIMULATING: Sending takedown confirmation email to ${data.to}. RESEND_API_KEY not configured.`);
    return { success: true, simulated: true };
  }
  try {
      await resend.emails.send({
          from: fromEmail,
          to: data.to,
          subject: 'Your DMCA Takedown Notice has been Submitted to YouTube',
          html: `<p>Hi ${data.creatorName},</p><p>This is a confirmation that your takedown request for the content at ${data.infringingUrl} has been submitted to YouTube.</p><p>We will notify you of any updates.</p>`,
      });
      return { success: true };
  } catch (error) {
      console.error("Failed to send takedown confirmation email:", error);
      return { success: false, message: "Could not send email." };
  }
}
