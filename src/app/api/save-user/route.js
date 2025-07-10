import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, channel, location } = body;

    if (!email)
      return Response.json({ error: "Missing email" }, { status: 400 });

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          ...(channel && {
            youtubeChannel: {
              id: channel.id,
              title: channel.title,
              thumbnail: channel.thumbnails?.default?.url || "",
            },
          }),
          ...(location && { location }),
        },
      },
      { new: true, upsert: true }
    );

    return Response.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Error saving user:", err);
    return Response.json({ error: "Failed to save user" }, { status: 500 });
  }
}
