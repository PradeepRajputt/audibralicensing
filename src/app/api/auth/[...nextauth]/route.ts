
// This file is no longer used and can be deleted.
// All auth logic is now handled by the client-side Firebase Auth.
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ message: "This route is no longer used." }, { status: 404 }) }
export async function POST() { return NextResponse.json({ message: "This route is no longer used." }, { status: 404 }) }
