// src/app/api/auth/google/route.js
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req) {
  const url = new URL(req.url);
  const redirectPath = url.searchParams.get("state") || "/dashboard";

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/youtube.readonly",
    ],
    state: redirectPath, // ✅ NO encoding here!
  });

  return NextResponse.redirect(authUrl);
}
