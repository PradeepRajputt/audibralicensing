
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createReport } from '@/lib/reports-store';
import { getContentById } from '@/lib/content-store';
import { auth } from '@/lib/firebase'; // Using firebase auth now
import type { User as FirebaseUser } from 'firebase/auth';
import { getUserById } from '@/lib/users-store';

const formSchema = z.object({
  originalContentId: z.string().min(1, "Please select your original content."),
  platform: z.string({required_error: "Please select a platform."}).min(1, "Please select a platform."),
  suspectUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  reason: z.string().min(10, { message: 'Reason must be at least 10 characters.' }),
});

export async function submitManualReportAction(userId: string, values: z.infer<typeof formSchema>) {
  if (!userId) {
      return { success: false, message: 'Authentication failed. Please log in again.' };
  }
  
  const user = await getUserById(userId);

  if (!user || !user.displayName) {
     return { success: false, message: 'Could not find user information.' };
  }

  const { displayName: creatorName } = user;
  
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map(issue => issue.message).join(', ');
    return { success: false, message: errorMessages };
  }
  
  try {
    const originalContent = await getContentById(parsed.data.originalContentId);

    if (!originalContent) {
        return { success: false, message: "Could not find the selected original content."}
    }
    
    await createReport({
      ...parsed.data,
      originalContentUrl: originalContent.videoURL || 'N/A',
      originalContentTitle: originalContent.title,
      creatorId: userId,
      creatorName: creatorName,
    });
    
  } catch (error) {
    console.error('Error submitting manual report:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: errorMessage };
  }
  
  revalidatePath('/dashboard/reports');
  revalidatePath('/admin/strikes');
  return { success: true, message: 'Report submitted and sent for admin review.' };
}
