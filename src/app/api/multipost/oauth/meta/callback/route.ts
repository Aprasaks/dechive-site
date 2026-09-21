import { NextRequest, NextResponse } from "next/server";
import { originFromRequest, verifyState } from "@/lib/multipost/oauth";
import {
  clearConnection,
  setConnection,
  type MetaPendingConnection,
} from "@/lib/multipost/session";

async function longToken(shortToken: string, appId: string, secret: string, version: string) {
  const url = new URL(`https://graph.facebook.com/${version}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", secret);
  url.searchParams.set("fb_exchange_token", shortToken);
  const response = await fetch(url, { cache: "no-store" });
  const json = await response.json();
  return response.ok && json.access_token ? String(json.access_token) : shortToken;
}

export async function GET(req: NextRequest) {
  const origin = originFromRequest(req.url);
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !(await verifyState("meta", state))) {
    return NextResponse.redirect(`${origin}/multipost-live?error=meta_state`);
  }
  const appId = process.env.META_APP_ID;
  const secret = process.env.META_APP_SECRET;
  if (!appId || !secret) return NextResponse.redirect(`${origin}/multipost-live?error=meta_config`);
  const version = process.env.META_GRAPH_VERSION || "v24.0";
  const redirectUri = `${origin}/api/multipost/oauth/meta/callback`;
  const tokenUrl = new URL(`https://graph.facebook.com/${version}/oauth/access_token`);
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", secret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);
  const tokenResponse = await fetch(tokenUrl, { cache: "no-store" });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) {
    return NextResponse.redirect(`${origin}/multipost-live?error=meta_token`);
  }
  const pending: MetaPendingConnection = {
    userAccessToken: await longToken(String(token.access_token), appId, secret, version),
  };
  await clearConnection("meta");
  await setConnection("meta_pending", pending);
  return NextResponse.redirect(`${origin}/multipost-live?connected=meta_pending`);
}
