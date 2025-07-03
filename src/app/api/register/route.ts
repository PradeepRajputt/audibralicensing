
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import { getUserById, createUser } from '@/lib/users-store';


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
    const { idToken, role = 'creator' } = body;

    if (!idToken) {
        return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    try {
        // MOCK: In a real app, you would verify this token with a proper backend SDK
        // For now, we trust the token from the client to get user details.
        const decodedToken = decodeJwtPayload(idToken);
         if (!decodedToken || !decodedToken.user_id || !decodedToken.email) {
             return NextResponse.json({ error: 'Token is missing required claims (uid, email).' }, { status: 400 });
        }

        const { user_id: uid, email, name } = decodedToken;

        let user = await getUserById(uid);

        if (user) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }
        
        const newUser = await createUser({
            uid,
            email: email,
            displayName: name || email.split('@')[0],
            role,
        });
        
        await createSession(newUser);

        return NextResponse.json({ success: true, user: newUser });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
