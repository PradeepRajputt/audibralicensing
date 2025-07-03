
'use server';

import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { User } from './types';

// The secret key should be a 32-byte (256-bit) random string.
// IMPORTANT: Set this in your .env.local file.
// You can generate one with: openssl rand -base64 32
const secret = process.env.SESSION_SECRET;
if (!secret) {
  throw new Error('SESSION_SECRET environment variable is not set.');
}
const key = new TextEncoder().encode(secret);

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function decrypt(session: string | undefined = '') {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

export async function createSession(user: User) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionPayload = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    expiresAt,
  };

  const session = await encrypt(sessionPayload);

  cookies().set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession(): Promise<{ uid: string; email: string; displayName: string; role: 'creator' | 'admin', expiresAt: Date } | null> {
  const sessionCookie = cookies().get('session')?.value;
  const session = await decrypt(sessionCookie);
  
  if (!session || typeof session !== 'object' || !session.uid) {
    return null;
  }

  return {
    uid: session.uid as string,
    email: session.email as string,
    displayName: session.displayName as string,
    role: session.role as 'creator' | 'admin',
    expiresAt: new Date(session.expiresAt as string),
  };
}

export async function deleteSession() {
  cookies().delete('session');
}
