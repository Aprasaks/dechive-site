import { NextRequest, NextResponse } from "next/server";
import { newState, originFromRequest } from "@/lib/multipost/oauth";

export async function GET(req: NextRequest) {
  const clientId = process.env.THREADS_APP_ID;
  if (!clientId) return NextResponse.json({ error: "THREADS_APP_ID is missing" }, { status: 500 });
  const state = await newState("threads");
  const origin = originFromRequest(req.url);
  const redirectUri = `${origin}/api/multipost/oauth/threads/callback`;
  const url = new URL("https://threads.net/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "threads_basic,threads_content_publish");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return NextResponse.redirect(url);
}
