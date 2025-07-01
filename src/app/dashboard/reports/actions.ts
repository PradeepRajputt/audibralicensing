
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createReport } from '@/lib/reports-store';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


const formSchema = z.object({
  platform: z.string({required_error: "Please select a platform."}).min(1, "Please select a platform."),
  suspectUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  reason: z.string().min(10, { message: 'Reason must be at least 10 characters.' }),
});

export async function submitManualReportAction(values: z.infer<typeof formSchema>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, message: "You must be logged in to submit a report." };
  }

  try {
    await createReport({
      ...values,
      creatorId: session.user.id,
      creatorName: session.user.name || 'Unknown Creator'
    });
    
    revalidatePath('/dashboard/reports');
    return { success: true, message: 'Report submitted and sent for admin review.' };

  } catch (error) {
    console.error('Error submitting manual report:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: errorMessage };
  }
}
