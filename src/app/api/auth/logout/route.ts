
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear both the secure and client-side cookies
    cookies().delete('token');
    cookies().delete('user-data');
    
    return NextResponse.json({ success: true, message: 'Logged out successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
