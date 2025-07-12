import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session.js';
import Creator from '@/models/Creator.js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });
  await connectToDatabase();
  const user = await Creator.findOne({ email });
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
  const sessions = await Session.find({ user: user._id }).lean();
  return Response.json({
    devices: sessions.map(s => ({
      id: s.sessionId,
      device: s.device,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastActive: s.lastActive,
    })),
  });
}

export async function DELETE(req: Request) {
  try {
    const { email, sessionId } = await req.json();
    if (!email || !sessionId) return Response.json({ error: 'Missing email or sessionId' }, { status: 400 });
    await connectToDatabase();
    const user = await Creator.findOne({ email });
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    await Session.deleteOne({ user: user._id, sessionId });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Failed to revoke device' }, { status: 500 });
  }
} 