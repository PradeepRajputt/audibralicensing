
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Received webhook from FastAPI:", body);
        return NextResponse.json({ status: 'ok', message: 'Webhook received' });

    } catch (error) {
        console.error('Error in FastAPI webhook:', error);
        return NextResponse.json({ status: 'error', message: 'Invalid request body or internal server error.' }, { status: 500 });
    }
}
