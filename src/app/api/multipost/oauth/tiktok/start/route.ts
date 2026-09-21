import { NextRequest, NextResponse } from "next/server";
import { newState, originFromRequest } from "@/lib/multipost/oauth";

export async function GET(req: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) return NextResponse.json({ error: "TIKTOK_CLIENT_KEY is missing" }, { status: 500 });
  const state = await newState("tiktok");
  const origin = originFromRequest(req.url);
  const redirectUri = `${origin}/api/multipost/oauth/tiktok/callback`;
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key", clientKey);
  url.searchParams.set("scope", "user.info.basic,video.publish");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return NextResponse.redirect(url);
}
