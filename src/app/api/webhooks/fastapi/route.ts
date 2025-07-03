
import { NextResponse } from 'next/server';
import { processViolationFromFastApi } from '@/lib/services/backend-services';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // In a real app, you would validate the payload and probably check a secret key/token
        // to ensure the request is coming from your trusted FastAPI service.

        console.log("Received webhook from FastAPI:", body);
        
        const result = await processViolationFromFastApi(body);

        if (result.success) {
            return NextResponse.json({ status: 'ok', message: 'Violation processed', violationId: result.violationId });
        } else {
             return NextResponse.json({ status: 'error', message: result.error || 'Failed to process violation' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in FastAPI webhook:', error);
        return NextResponse.json({ status: 'error', message: 'Invalid request body or internal server error.' }, { status: 500 });
    }
}
