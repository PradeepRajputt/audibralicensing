import { google } from "googleapis";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const redirectPath = url.searchParams.get("state") || "/dashboard";

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const { data: userInfo } = await oauth2.userinfo.get();

  const youtube = google.youtube("v3");

  // 🔥 YouTube API call to get channel info
  const { data: channelData } = await youtube.channels.list({
    auth: oauth2Client,
    mine: true,
    part: "id,snippet",
  });

  const channel = channelData.items?.[0];

  await connectToDatabase();

  let user = await User.findOne({ googleId: userInfo.id });

  if (!user) {
    user = await User.create({
      googleId: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      image: userInfo.picture,
      youtubeChannelId: channel?.id || null,
      youtubeChannelTitle: channel?.snippet?.title || null,
    });
  } else {
    // 📝 Update user with YouTube info if not already saved
    user.youtubeChannelId = user.youtubeChannelId || channel?.id || null;
    user.youtubeChannelTitle =
      user.youtubeChannelTitle || channel?.snippet?.title || null;
    await user.save();
  }

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${redirectPath}`); // ✅ absolute URL
}
