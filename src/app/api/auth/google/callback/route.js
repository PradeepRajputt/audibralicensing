import { google } from "googleapis";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Creator from "@/models/Creator";

const ADMIN_EMAILS = [
  "guddumisra003@gmail.com",
  "contactpradeeprajput@gmail.com"
];

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

  const userLocation = userInfo.locale && userInfo.locale.trim() ? userInfo.locale : "Unknown";

  if (ADMIN_EMAILS.includes(userInfo.email)) {
    // Save as admin
    let admin = await Admin.findOne({ email: userInfo.email });
    if (!admin) {
      admin = await Admin.create({
        name: userInfo.name,
        email: userInfo.email,
        location: userLocation,
        youtubeChannel: channel
          ? {
              id: channel.id || '',
              title: channel.snippet?.title || '',
              thumbnail: channel.snippet?.thumbnails?.default?.url || '',
            }
          : undefined,
      });
    } else {
      admin.name = userInfo.name;
      admin.location = admin.location || userLocation;
      if (channel) {
        admin.youtubeChannel = {
          id: channel.id || '',
          title: channel.snippet?.title || '',
          thumbnail: channel.snippet?.thumbnails?.default?.url || '',
        };
      }
      await admin.save();
    }
  } else {
    // Save as creator
    let creator = await Creator.findOne({ email: userInfo.email });
    if (!creator) {
      creator = await Creator.create({
        name: userInfo.name,
        email: userInfo.email,
        location: userLocation,
        youtubeChannel: channel
          ? {
              id: channel.id || '',
              title: channel.snippet?.title || '',
              thumbnail: channel.snippet?.thumbnails?.default?.url || '',
            }
          : undefined,
      });
    } else {
      creator.name = userInfo.name;
      creator.location = creator.location || userLocation;
      if (channel) {
        creator.youtubeChannel = {
          id: channel.id || '',
          title: channel.snippet?.title || '',
          thumbnail: channel.snippet?.thumbnails?.default?.url || '',
        };
      }
      await creator.save();
    }
  }

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${redirectPath}`); // ✅ absolute URL
}
