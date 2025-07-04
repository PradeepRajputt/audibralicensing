import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getUserById } from '@/lib/users-store';
import type { DecodedJWT } from '@/lib/types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(request: Request) {
    const token = cookies().get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: DecodedJWT };
        const user = await getUserById(payload.id);

        if (!user) {
             return NextResponse.json({ user: null }, { status: 404 });
        }
        
        return NextResponse.json({ user });

    } catch (error) {
        console.error("JWT verification failed:", error);
        // Clear invalid cookie
        cookies().delete('auth_token');
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
