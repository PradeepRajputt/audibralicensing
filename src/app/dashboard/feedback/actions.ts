
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

export async function submitFeedbackAction(values: z.infer<typeof formSchema>, userEmail: string) {
  // Use userEmail for all feedback logic
  const creatorName = 'Sample Creator';
  
  try {
    await addFeedback({
      creatorEmail: userEmail,
      creatorName,
      title: values.title,
      rating: values.rating,
      tags: values.tags,
      description: values.description,
      message: values.message || '',
      type: values.type,
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
