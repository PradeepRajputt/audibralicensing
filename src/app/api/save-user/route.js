import connectToDatabase from "@/lib/mongodb";
import Creator from "@/models/Creator.js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, youtubeChannelId, youtubeChannel, name, password, ...updateFields } = body;

    if (!email)
      return Response.json({ error: "Missing email" }, { status: 400 });

    await connectToDatabase();

    let user = await Creator.findOne({ email });
    if (!user) {
      // Create new user with minimal info (set random password if not provided)
      const randomPassword = password || Math.random().toString(36).slice(-8);
      user = await Creator.create({
        email,
        name: name || email.split('@')[0],
        password: randomPassword,
        youtubeChannelId: youtubeChannelId || undefined,
        youtubeChannel: youtubeChannel || undefined,
        ...updateFields,
      });
    } else {
      const update = { ...updateFields };
      update.youtubeChannelId = youtubeChannelId || null;
      update.youtubeChannel = youtubeChannel || null;
      await Creator.updateOne({ email }, { $set: update });
      user = await Creator.findOne({ email }); // fetch updated user
    }
    return Response.json({
      success: true,
      name: user.name,
      email: user.email,
      youtubeChannelId: user.youtubeChannelId,
      youtubeChannel: user.youtubeChannel,
    });
  } catch (err) {
    console.error("Error saving user:", err);
    return Response.json({ error: "Failed to save user" }, { status: 500 });
  }
}
