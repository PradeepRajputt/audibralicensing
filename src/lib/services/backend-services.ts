
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
const fromEmail = 'CreatorShield <onboarding@resend.dev>'; // Resend's default test address

/**
 * Stores a violation reported by the backend and sends an email alert to the creator.
 * This function is intended to be called by a webhook from our FastAPI service.
 */
export async function processViolationFromFastApi(violationData: Omit<Violation, 'id' | 'detectedAt'> & { creatorEmail: string }) {
  if (!resend) {
    console.error('Resend API key is not configured. Email will not be sent.');
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
    console.warn(`Resend not configured. Skipping reactivation approval email to ${to}.`);
    return { success: true, simulated: true };
  }
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Your CreatorShield Account has been Reactivated',
      html: `
        <h1>Account Reactivated</h1>
        <p>Hi ${name},</p>
        <p>Welcome back! Your request to reactivate your account has been approved.</p>
        <p>You can now log in to your CreatorShield dashboard.</p>
        <br/>
        <p>Thanks,</p>
        <p>The CreatorShield Team</p>
      `,
    });
    console.log(`Sent reactivation approval email to ${to}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error(`Error sending reactivation approval email to ${to}:`, error);
    return { success: false, simulated: false, error: (error as Error).message };
  }
}

export async function sendReactivationDenialEmail({ to, name }: { to: string; name: string }) {
 if (!resend) {
    console.warn(`Resend not configured. Skipping reactivation denial email to ${to}.`);
    return { success: true, simulated: true };
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
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
    });
    console.log(`Sent reactivation denial email to ${to}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error(`Error sending reactivation denial email to ${to}:`, error);
    return { success: false, simulated: false, error: (error as Error).message };
  }
}

export async function sendTakedownConfirmationEmail(data: {
  to: string;
  creatorName: string;
  infringingUrl: string;
  originalUrl: string;
}) {
  if (!resend) {
    console.warn(`Resend not configured. Skipping takedown confirmation email to ${data.to}.`);
    return { success: true, simulated: true };
  }

  try {
    await resend.emails.send({
        from: fromEmail,
        to: data.to,
        subject: `[Confirmation] Copyright Takedown Notice Submitted for ${data.creatorName}`,
        html: `
            <h1>Takedown Notice Submitted</h1>
            <p>This is a confirmation that a DMCA takedown notice has been submitted to YouTube on behalf of <strong>${data.creatorName}</strong>.</p>
            <p><strong>Infringing URL:</strong> ${data.infringingUrl}</p>
            <p><strong>Original Content URL:</strong> ${data.originalUrl}</p>
            <p>We will monitor the status of this request. No further action is needed from you at this time.</p>
            <br/>
            <p>The CreatorShield Team</p>
        `,
    });
    console.log(`Sent takedown confirmation email to ${data.to}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error(`Error sending takedown confirmation email to ${data.to}:`, error);
    // Don't throw, just log the error
    return { success: false, simulated: false, error: (error as Error).message };
  }
}

export async function sendLoginOtpEmail({ to, otp }: { to: string; otp: string }) {
   if (!resend) {
    console.warn(`Resend not configured. OTP for ${to} is: ${otp}. This will not be sent.`);
    return { success: true, simulated: true };
  }
  
  try {
    await resend.emails.send({
        from: fromEmail,
        to: to,
        subject: 'Your CreatorShield Login Code',
        html: `
            <h1>Your Login Code</h1>
            <p>Here is your one-time password to log in to CreatorShield:</p>
            <h2 style="font-size: 24px; letter-spacing: 4px; text-align: center;">${otp}</h2>
            <p>This code will expire in 10 minutes.</p>
            <br/>
            <p>If you did not request this, you can safely ignore this email.</p>
        `,
    });
    console.log(`Sent OTP to ${to}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error(`Error sending OTP email to ${to}:`, error);
    return { success: false, simulated: false, error: (error as Error).message };
  }
}
