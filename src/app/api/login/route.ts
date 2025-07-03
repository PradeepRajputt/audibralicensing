
'use server';
// This file is kept for historical context but is not used by the main application flow.
// The new login flow uses the Server Action in /src/app/login/actions.ts.
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json({ 
        success: false, 
        message: 'This API route is deprecated. Please use the login form.' 
    }, { status: 404 });
}
