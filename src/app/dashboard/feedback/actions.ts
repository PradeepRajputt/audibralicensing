
'use server';

import { revalidatePath } from 'next/cache';
import { z } from "zod";
import { addFeedback, markFeedbackAsRead } from '@/lib/feedback-store';

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  rating: z.number().min(1).max(5),
  tags: z.string().optional(),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  message: z.string().optional(),
  type: z.enum(['general', 'disconnect-request']),
});

export async function submitFeedbackAction(values: z.infer<typeof formSchema>) {
  // Using a mock user ID and details since auth is removed.
  const creatorName = 'Sample Creator';
  const creatorEmail = 'creator@example.com'; // Dummy email for now
  
  try {
    await addFeedback({
      creatorEmail,
      creatorName,
      type: values.type,
      message: values.message || '',
      status: 'pending',
    });
    
    revalidatePath('/dashboard/feedback');
    revalidatePath('/admin/feedback');

    return { success: true, message: 'Your feedback has been submitted successfully!' };

  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

export async function markAsReadAction(feedbackId: string) {
    try {
        await markFeedbackAsRead(feedbackId);
        revalidatePath('/dashboard/feedback');
        return { success: true, message: 'Marked as read' };
    } catch (error) {
        return { success: false, message: "Could not mark as read." };
    }
}
