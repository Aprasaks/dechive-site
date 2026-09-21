import { NextRequest, NextResponse } from "next/server";
import { newState, originFromRequest } from "@/lib/multipost/oauth";

export async function GET(req: NextRequest) {
  const appId = process.env.META_APP_ID;
  if (!appId) return NextResponse.json({ error: "META_APP_ID is missing" }, { status: 500 });
  const state = await newState("meta");
  const origin = originFromRequest(req.url);
  const version = process.env.META_GRAPH_VERSION || "v24.0";
  const redirectUri = `${origin}/api/multipost/oauth/meta/callback`;
  const scopes = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "instagram_basic",
    "instagram_content_publish",
  ].join(",");
  const url = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  return NextResponse.redirect(url);
}
