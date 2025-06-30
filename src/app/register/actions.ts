
'use server';

import { z } from 'zod';
import { createUser, getUserByEmail } from '@/lib/firebase/firestore';
import { hashPassword } from '@/lib/auth';
import type { User } from '@/lib/firebase/types';
import { redirect } from 'next/navigation';

const registerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export async function registerUser(values: z.infer<typeof registerFormSchema>) {
    try {
        const existingUser = await getUserByEmail(values.email);

        if (existingUser) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const passwordHash = await hashPassword(values.password);

        const newUser: Omit<User, 'uid'> = {
            displayName: values.name,
            email: values.email,
            passwordHash,
            role: 'creator',
            joinDate: new Date().toISOString(),
            platformsConnected: [],
            status: 'active',
            avatar: `https://placehold.co/128x128.png`,
        };

        await createUser(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred. Please try again.';
        return { success: false, message };
    }

    // Redirect to login only on successful creation
    redirect('/login');
}
