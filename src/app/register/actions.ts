
'use server';

import { z } from 'zod';
import { createUser } from '@/lib/users';
import { redirect } from 'next/navigation';

const registerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export async function registerUser(values: z.infer<typeof registerFormSchema>) {
    try {
        // The createUser function now handles checking for existing users.
        await createUser({
            displayName: values.name,
            email: values.email,
            password: values.password,
            // These are default values for a new user
            role: 'creator',
            joinDate: new Date().toISOString(),
            platformsConnected: [],
            status: 'active',
            avatar: `https://placehold.co/128x128.png`,
        });

    } catch (error) {
        console.error("Registration Server Action Error:", error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred. Please try again.' };
    }

    // Redirect to login only on successful creation
    redirect('/login?registered=true');
}
