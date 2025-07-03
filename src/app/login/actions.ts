
'use server'

import { redirect } from 'next/navigation'
import { createSession } from '@/lib/session'
import { getUserByEmail } from '@/lib/users-store'
import { z } from 'zod'
import type { User } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export async function loginAction(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.flatten().fieldErrors.email?.[0] || validatedFields.error.flatten().fieldErrors.password?.[0] || "Invalid input."
    }
  }

  const { email } = validatedFields.data;
  let user: User | null = null;

  try {
    user = await getUserByEmail(email);

    // For this prototype, we're not checking the password.
    // In a real app, you would hash and compare the password.
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    await createSession(user);

  } catch (error) {
    console.error(error);
    return { success: false, message: 'An internal error occurred. Please try again.' };
  }
  
  if (user.role === 'admin') {
     redirect('/admin/users');
  }
  redirect('/dashboard/overview');
}
