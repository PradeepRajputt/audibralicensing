
'use server'

import { redirect } from 'next/navigation'
import { getUserByEmail, createUser } from '@/lib/users-store'
import { z } from 'zod'

// In a real app, you would use a stronger password validation
const signupSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export async function signupAction(prevState: any, formData: FormData) {
  const validatedFields = signupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.flatten().fieldErrors.displayName?.[0] 
        || validatedFields.error.flatten().fieldErrors.email?.[0]
        || validatedFields.error.flatten().fieldErrors.password?.[0]
        || "Invalid input."
    }
  }

  const { email, displayName, password } = validatedFields.data

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    // In a real app, you would hash the password here before saving
    // For this prototype, we're not storing the password.
    
    await createUser({
      uid: `user_${Date.now()}`, // Simple unique ID for prototype
      email,
      displayName,
      role: 'creator',
    });
    
    // No session creation here, user must log in after signing up.

  } catch (error) {
    console.error(error);
    return { success: false, message: 'An internal error occurred. Please try again.' };
  }
  
  redirect('/login');
}
