
'use server';

import { z } from 'zod';
import { createUser, getUserByEmail } from '@/lib/users-store';
import bcrypt from 'bcryptjs';
import { signIn } from '@/auth';

const registerSchema = z.object({
    displayName: z.string().min(2, 'Display name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    phone: z.string().min(10, 'Please enter a valid phone number.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export async function registerAction(prevState: any, formData: FormData) {
    const validatedFields = registerSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            success: false,
            message: validatedFields.error.errors.map(e => e.message).join(', ')
        };
    }

    try {
        const { displayName, email, phone, password } = validatedFields.data;

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user in the database
        await createUser({
            displayName,
            email,
            phone,
            passwordHash,
            role: 'creator',
            joinDate: new Date().toISOString(),
            status: 'active',
            platformsConnected: [],
            avatar: 'https://placehold.co/128x128.png'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Something went wrong. Please try again.' };
    }
    
    // Automatically sign in the user after successful registration
    try {
        await signIn('credentials', formData);
    } catch(error) {
       // This can happen if there's a redirection. Next.js handles it.
       // It's not a true error in this flow.
    }

    return { success: true, message: 'Registration successful!' };
}
