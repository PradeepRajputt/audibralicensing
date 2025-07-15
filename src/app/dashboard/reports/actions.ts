
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createReport } from '@/lib/reports-store';
import { getContentById } from '@/lib/content-store';
import { getUserByEmail } from '@/lib/users-store';

const formSchema = z.object({
  originalContentId: z.string().min(1, "Please select your original content."),
  platform: z.string({ required_error: "Please select a platform." }).min(1, "Please select a platform."),
  suspectUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  reason: z.string().min(10, { message: 'Reason must be at least 10 characters.' }),
});

export async function submitManualReportAction(values: z.infer<typeof formSchema>, userEmail: string) {
  const user = await getUserByEmail(userEmail);
  if (!user) {
    return { success: false, message: 'Could not find user information to submit report.' };
  }
  // Fallbacks for name and avatar
  const creatorName = user.displayName || user.name || 'Unknown Creator';
  const creatorAvatar = user.avatar || user.image || '';
  const { _id } = user;
  const parsed = formSchema.safeParse(values);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map(issue => issue.message).join(', ');
    return { success: false, message: errorMessages };
  }
  try {
    const originalContent = await getContentById(parsed.data.originalContentId);
    if (!originalContent) {
      return { success: false, message: "Could not find the selected original content." };
    }
    await createReport({
      platform: parsed.data.platform,
      suspectUrl: parsed.data.suspectUrl,
      reason: parsed.data.reason,
      originalContentUrl: originalContent.videoURL || 'N/A',
      originalContentTitle: originalContent.title,
      creatorId: _id.toString(),
      creatorName: creatorName,
      creatorAvatar: creatorAvatar,
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
