import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator.js';
import Session from '@/models/Session.js';

export async function DELETE(req: Request) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });
  await connectToDatabase();
  const user = await Creator.findOne({ email });
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
  await Session.deleteMany({ user: user._id });
  await Creator.deleteOne({ _id: user._id });
  return Response.json({ success: true });
} 