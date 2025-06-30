
'use server';

import { z } from 'zod';
import { createUser } from '@/lib/users';
import { redirect } from 'next/navigation';

const registerFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export async function registerUser(values: z.infer<typeof registerFormSchema>) {
    try {
        const validatedFields = registerFormSchema.safeParse(values);
        if (!validatedFields.success) {
            return { success: false, message: 'Invalid form data provided.' };
        }
        
        await createUser({
            displayName: validatedFields.data.displayName,
            email: validatedFields.data.email,
            password: validatedFields.data.password,
            role: 'creator',
            joinDate: new Date().toISOString(),
            platformsConnected: [],
            status: 'active',
            avatar: `https://placehold.co/128x128.png`,
        });

    } catch (error) {
        console.error("Registration Server Action Error:", error);
        if (error instanceof Error) {
            // Return specific, safe error messages to the client
            if (error.message.includes('already exists')) {
                return { success: false, message: 'An account with this email already exists.' };
            }
            return { success: false, message: 'An unexpected server error occurred.' };
        }
        return { success: false, message: 'An unknown error occurred.' };
    }

    // Redirect to login only on successful creation
    redirect('/login?registered=true');
}
