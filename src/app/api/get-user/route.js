import connectToDatabase from "@/lib/mongodb";
import Creator from "@/models/Creator.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });
  await connectToDatabase();
  const user = await Creator.findOne({ email }).lean();
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
  return Response.json({
    _id: user._id, // Add this line to return the user ID
    name: user.name,
    email: user.email,
    youtubeChannelId: user.youtubeChannelId,
    youtubeChannel: user.youtubeChannel,
  });
}
