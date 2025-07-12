import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator.js';
import Session from '@/models/Session.js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });
  await connectToDatabase();
  const user = await Creator.findOne({ email }).lean();
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
  const sessions = await Session.find({ user: user._id }).lean();
  const data = {
    user,
    sessions,
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="my-data.json"',
    },
  });
} 