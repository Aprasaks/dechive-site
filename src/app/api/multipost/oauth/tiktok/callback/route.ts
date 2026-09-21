import { NextRequest, NextResponse } from "next/server";
import { originFromRequest, verifyState } from "@/lib/multipost/oauth";
import { setConnection, type TikTokConnection } from "@/lib/multipost/session";

export async function GET(req: NextRequest) {
  const origin = originFromRequest(req.url);
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !(await verifyState("tiktok", state))) {
    return NextResponse.redirect(`${origin}/multipost-live?error=tiktok_state`);
  }
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
    code,
    grant_type: "authorization_code",
    redirect_uri: `${origin}/api/multipost/oauth/tiktok/callback`,
  });
  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const json = await response.json();
  if (!response.ok || !json.access_token) {
    return NextResponse.redirect(`${origin}/multipost-live?error=tiktok_token`);
  }
  const connection: TikTokConnection = {
    accessToken: String(json.access_token),
    refreshToken: json.refresh_token ? String(json.refresh_token) : undefined,
    openId: json.open_id ? String(json.open_id) : undefined,
    expiresAt: Date.now() + Number(json.expires_in || 0) * 1000,
  };
  await setConnection("tiktok", connection);
  return NextResponse.redirect(`${origin}/multipost-live?connected=tiktok`);
}
