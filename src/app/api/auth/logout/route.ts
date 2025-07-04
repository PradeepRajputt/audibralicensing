import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        cookies().delete('auth_token');
        return NextResponse.json({ success: true, message: 'Logged out' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Logout failed' }, { status: 500 });
    }
}
