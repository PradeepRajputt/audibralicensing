
import { NextResponse } from 'next/server';
import { processViolationFromFastApi } from '@/lib/services/backend-services';
import type { Violation } from '@/lib/firebase/types';
import { z } from 'zod';

// Define the expected shape of the incoming webhook payload
const violationWebhookSchema = z.object({
  creatorId: z.string(),
  creatorEmail: z.string().email(),
  matchedURL: z.string().url(),
  platform: z.enum(['youtube', 'web', 'instagram', 'tiktok']),
  matchScore: z.number().min(0).max(1),
  status: z.enum(['pending_review', 'action_taken', 'dismissed']),
});


/**
 * This API route acts as a webhook endpoint for an external service (e.g., FastAPI)
 * to send detected copyright violation data. It processes the data and stores it.
 * To secure this endpoint, it checks for a secret 'Authorization' header.
 *
 * Example usage with curl:
 * curl -X POST "http://localhost:9002/api/webhooks/fastapi" \
 * -H "Authorization: Bearer YOUR_CRON_SECRET" \
 * -H "Content-Type: application/json" \
 * -d '{
 *      "creatorId": "some-user-id",
 *      "creatorEmail": "creator@example.com",
 *      "matchedURL": "https://example.com/stolen-content",
 *      "platform": "web",
 *      "matchScore": 0.95,
 *      "status": "pending_review"
 *    }'
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = violationWebhookSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: 'Invalid payload', details: validation.error.format() }), { status: 400 });
    }

    const result = await processViolationFromFastApi(validation.data);
    
    if (result.success) {
        return NextResponse.json({ message: 'Violation processed successfully', violationId: result.violationId });
    } else {
        return new NextResponse(JSON.stringify({ error: 'Failed to process violation', details: result.error }), { status: 500 });
    }
  } catch (error) {
    console.error('Error in FastAPI webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
