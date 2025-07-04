
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { setBackupPin } from '@/lib/users-store';

const setPinSchema = z.object({
  userId: z.string(),
  pin: z.string().length(4, { message: "PIN must be exactly 4 digits." }).regex(/^\d+$/, { message: "PIN must only contain numbers."}),
});


export async function setBackupPinAction(userId: string, pin: string) {
    const validation = setPinSchema.safeParse({ userId, pin });
    if (!validation.success) {
        return { success: false, message: validation.error.flatten().fieldErrors.pin?.join(', ') || "Invalid input." };
    }

    try {
        const hashedPin = await bcrypt.hash(pin, 10);
        await setBackupPin(userId, hashedPin);
        
        revalidatePath('/dashboard/settings');
        return { success: true, message: "Backup PIN set successfully." };

    } catch (error) {
        console.error("Error setting backup PIN:", error);
        return { success: false, message: "Could not set backup PIN. Please try again."};
    }
}
