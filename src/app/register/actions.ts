
'use server';

import { z } from 'zod';
import { createUser, getUserByEmail } from '@/lib/users-store';

const registerFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export async function registerUser(values: z.infer<typeof registerFormSchema>) {
    try {
        const validatedFields = registerFormSchema.safeParse(values);
        if (!validatedFields.success) {
            const errorMessages = validatedFields.error.flatten().fieldErrors;
            const firstError = Object.values(errorMessages)[0]?.[0] || 'Invalid form data provided.';
            return { success: false, message: firstError };
        }
        
        const existingUser = await getUserByEmail(validatedFields.data.email);
        if (existingUser) {
            return { success: false, message: "An account with this email already exists." };
        }
        
        await createUser({
            displayName: validatedFields.data.displayName,
            email: validatedFields.data.email,
            password: validatedFields.data.password,
            role: 'creator', 
        });

    } catch (error) {
        console.error("Registration Server Action Error:", error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'An unknown error occurred during registration.' };
    }
    
    return { success: true, message: 'Registration successful!' };
}
