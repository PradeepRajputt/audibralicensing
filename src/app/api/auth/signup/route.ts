
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { z } from 'zod';
import { createUserInFirestore } from '@/lib/users-store';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
    }

    const { email, password, displayName } = validation.data;

    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    
    // Create corresponding user document in Firestore
    await createUserInFirestore({
        uid: userRecord.uid,
        email,
        displayName,
        role: 'creator', // Default role for new sign-ups
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error('Signup error:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error.code === 'auth/email-already-exists') {
        errorMessage = 'This email address is already in use by another account.';
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
