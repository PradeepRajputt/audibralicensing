
import { NextResponse } from 'next/server';

/**
 * This is a catch-all route to handle any requests that might still be
 * made to the old /api/auth endpoints. It simply returns a 404 Not Found
 * response, as this API is no longer in use.
 */
export async function GET() {
  return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}

// Ensure this route runs on the Node.js runtime if it were to use server-side libraries.
export const runtime = 'nodejs';
