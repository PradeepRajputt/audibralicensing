
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, getUserByEmail } from '@/lib/users-store';

const registerSchema = z.object({
  displayName: z.string().min(3, 'Display name must be at least 3 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input.', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { displayName, email, password } = validation.data;

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    await createUser({ displayName, email, password });

    return NextResponse.json({ success: true, message: 'User registered successfully.' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
