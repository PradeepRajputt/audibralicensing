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

const emailTemplates: Record<string, { subject: string; body: (name: string, date: string, url: string) => string }> = {
  standard: {
    subject: 'Update on Your Copyright Strike Request',
    body: (name, date, url) => `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <p>Hi ${name},</p>
        <p>This is to inform you that your copyright strike request for the content at <strong>${url}</strong> (submitted on ${date}) has been reviewed and approved by our team.</p>
        <p>We will now proceed with the formal takedown process with the concerned platform. You will be notified once the platform takes action or if further information is required.</p>
        <p>Thank you for your patience and for helping us protect your content.</p>
        <p>Sincerely,<br/>The CreatorShield Team</p>
      </div>
    `,
  },
  urgent: {
    subject: 'IMMEDIATE ACTION: Your Copyright Strike Request is Approved',
    body: (name, date, url) => `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <p>Hi ${name},</p>
        <p><strong>This is an urgent update regarding your copyright strike request for ${url} (from ${date}).</strong></p>
        <p>Our team has reviewed and approved your request on a priority basis. We are initiating the takedown procedure immediately.</p>
        <p>Please monitor your dashboard for further updates from the platform. We understand the importance of this matter and are treating it with the highest priority.</p>
        <p>Thank you for your prompt action.</p>
        <p>Sincerely,<br/>The CreatorShield Team</p>
      </div>
    `,
  },
};


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

export async function sendStrikeApprovalEmail({ to, creatorName, infringingUrl, submissionDate, templateId }: { to: string; creatorName: string; infringingUrl: string; submissionDate: string, templateId: string }) {
  if (!resend) {
    console.warn(`SIMULATING: Sending strike approval email to ${to}. RESEND_API_KEY not configured.`);
    return { success: true, simulated: true };
  }
  
  const template = emailTemplates[templateId] || emailTemplates.standard;
  const formattedDate = new Date(submissionDate).toLocaleDateString();
  const emailBody = template.body(creatorName, formattedDate, infringingUrl);
  
  try {
    const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: to,
        subject: template.subject,
        html: emailBody,
    });
    if (error) {
      throw error;
    }
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send strike approval email:", error);
    return { success: false, message: "Could not send email." };
  }
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
