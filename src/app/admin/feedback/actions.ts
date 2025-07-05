
'use server';

import { revalidatePath } from 'next/cache';
import { addReplyToFeedback } from '@/lib/feedback-store';
import { auth } from '@/lib/auth';

export async function replyToFeedbackAction(feedbackId: string, replyMessage: string) {
  if (!replyMessage.trim()) {
    return { success: false, message: 'Reply message cannot be empty.' };
  }

  const session = await auth();
  if (!session?.user?.name) {
    return { success: false, message: 'Authentication required.' };
  }

  try {
    await addReplyToFeedback(feedbackId, {
      adminName: session.user.name,
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
