
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import { getUserById, getUserByEmail, createUser } from '@/lib/users-store';
import { adminAuth } from '@/lib/firebase-client';
import { signInWithEmailAndPassword } from 'firebase/auth';

// This function decodes the token payload without verification
// For prototype purposes. In production, always verify with a secure backend SDK.
function decodeJwtPayload(token: string) {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload;
    } catch (e) {
        console.error("Invalid token:", e);
        return null;
    }
}


export async function POST(request: Request) {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
        return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    try {
        // MOCK: In a real app, you would verify this token with a proper backend SDK
        // For now, we trust the token from the client to get the UID.
        const decodedToken = decodeJwtPayload(idToken);
        if (!decodedToken || !decodedToken.user_id) {
             return NextResponse.json({ error: 'Invalid ID token.' }, { status: 401 });
        }
        
        const uid = decodedToken.user_id;
        
        const user = await getUserById(uid);

        if (!user) {
             return NextResponse.json({ error: 'User not found. Please register.' }, { status: 404 });
        }
        
        await createSession(user);

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('Login error:', error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
