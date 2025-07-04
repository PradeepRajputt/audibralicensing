
/**
 * @file This file contains server-side functions for interacting with external services
 * like a FastAPI backend, YouTube Data API, and Resend for emails.
 */
'use server';

import { createViolation } from '@/lib/violations-store';
import type { Violation } from '@/lib/types';
// The Resend import is removed as we are simulating email sending.
// import { Resend } from 'resend';

// Initialize Resend
// const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = 'CreatorShield <onboarding@resend.dev>'; // This would be your verified domain

/**
 * Stores a violation reported by the backend and sends an email alert to the creator.
 * This function is intended to be called by a webhook from our FastAPI service.
 */
export async function processViolationFromFastApi(violationData: Omit<Violation, 'id' | 'detectedAt'> & { creatorEmail: string }) {
  // if (!resend) {
  //   console.error('Resend API key is not configured. Email will not be sent.');
  // }
  console.log("Simulating sending email for violation: ", violationData.matchedURL)


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

    // Real email sending logic is commented out for the prototype.
    /*
    if (resend) {
        await resend.emails.send({ ... });
        console.log(`Sent violation alert email to ${violationData.creatorEmail}`);
    }
    */
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
  console.warn(`SIMULATING: Sending reactivation approval email to ${to}.`);
  return { success: true, simulated: true };
}

export async function sendReactivationDenialEmail({ to, name }: { to: string; name: string }) {
 console.warn(`SIMULATING: Sending reactivation denial email to ${to}.`);
 return { success: true, simulated: true };
}

export async function sendTakedownConfirmationEmail(data: {
  to: string;
  creatorName: string;
  infringingUrl: string;
  originalUrl: string;
}) {
  console.warn(`SIMULATING: Sending takedown confirmation email to ${data.to}.`);
  return { success: true, simulated: true };
}

export async function sendLoginOtpEmail({ to, otp }: { to: string; otp: string }) {
    // For this prototype, we will not send a real email to avoid configuration issues.
    // We will log it to the server console and return it so the client can display it for easy testing.
    console.log(`**************************************************`);
    console.log(`** OTP for ${to} is: ${otp} **`);
    console.log(`**************************************************`);
    
    // In a real app, you would uncomment and use the Resend code below:
    /*
    if (!resend) {
        const message = 'Resend API key is not configured. Cannot send email.';
        console.error(message);
        return { success: false, message, otp: null };
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
        return { success: true, otp: null }; // Don't send OTP to client in production
    } catch (error) {
        console.error(`Error sending OTP email to ${to}:`, error);
        return { success: false, message: "Could not send OTP email.", otp: null };
    }
    */

    return { success: true, message: "OTP Generated (simulation)", otp };
}
