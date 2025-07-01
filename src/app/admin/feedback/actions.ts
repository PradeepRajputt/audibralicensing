
'use server';

import { revalidatePath } from 'next/cache';
import { addReplyToFeedback } from '@/lib/feedback-store';

export async function replyToFeedbackAction(feedbackId: string, replyMessage: string, adminName: string = 'Admin') {
  if (!replyMessage.trim()) {
    return { success: false, message: 'Reply message cannot be empty.' };
  }

  try {
    await addReplyToFeedback(feedbackId, {
      adminName,
      message: replyMessage,
    });
    revalidatePath('/admin/feedback');
    revalidatePath('/dashboard/feedback'); // Revalidate for the creator too
    return { success: true, message: 'Reply sent successfully.' };
  } catch (error) {
    console.error('Error replying to feedback:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message };
  }
}
