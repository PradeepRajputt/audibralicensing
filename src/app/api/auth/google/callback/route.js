// /src/app/api/auth/google/callback/route.js

import { google } from "googleapis";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code missing" },
      { status: 400 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    // Log the authenticated user
    console.log("Authenticated user:", data);

    // Get redirect URL from cookie
    const redirectPath = url.searchParams.get("state") || "/dashboard";
    const absoluteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${redirectPath}`;
    return NextResponse.redirect(absoluteUrl);
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}
