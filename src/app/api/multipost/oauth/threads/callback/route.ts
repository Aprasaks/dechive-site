import { NextRequest, NextResponse } from "next/server";
import { originFromRequest, verifyState } from "@/lib/multipost/oauth";
import { setConnection, type ThreadsConnection } from "@/lib/multipost/session";

export async function GET(req: NextRequest) {
  const origin = originFromRequest(req.url);
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !(await verifyState("threads", state))) {
    return NextResponse.redirect(`${origin}/multipost-live?error=threads_state`);
  }
  const redirectUri = `${origin}/api/multipost/oauth/threads/callback`;
  const url = new URL("https://graph.threads.net/oauth/access_token");
  url.searchParams.set("client_id", process.env.THREADS_APP_ID || "");
  url.searchParams.set("client_secret", process.env.THREADS_APP_SECRET || "");
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);
  const response = await fetch(url, { method: "POST", cache: "no-store" });
  const json = await response.json();
  if (!response.ok || !json.access_token) {
    return NextResponse.redirect(`${origin}/multipost-live?error=threads_token`);
  }
  const connection: ThreadsConnection = {
    accessToken: String(json.access_token),
    userId: String(json.user_id),
  };
  await setConnection("threads", connection);
  return NextResponse.redirect(`${origin}/multipost-live?connected=threads`);
}
