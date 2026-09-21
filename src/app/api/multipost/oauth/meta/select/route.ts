import { NextRequest, NextResponse } from "next/server";
import {
  clearConnection,
  getConnection,
  setConnection,
  type MetaConnection,
  type MetaPendingConnection,
} from "@/lib/multipost/session";

type MetaPage = {
  id?: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: { id?: string; username?: string };
};

export async function POST(req: NextRequest) {
  const pending = await getConnection<MetaPendingConnection>("meta_pending");
  if (!pending?.userAccessToken) {
    return NextResponse.json({ error: "Meta 로그인을 먼저 진행하세요." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const pageId = typeof body.pageId === "string" ? body.pageId : "";
  if (!pageId) return NextResponse.json({ error: "Facebook Page를 선택하세요." }, { status: 400 });

  const version = process.env.META_GRAPH_VERSION || "v24.0";
  const url = new URL(`https://graph.facebook.com/${version}/me/accounts`);
  url.searchParams.set("fields", "id,name,access_token,instagram_business_account{id,username}");
  url.searchParams.set("access_token", pending.userAccessToken);
  const response = await fetch(url, { cache: "no-store" });
  const json = await response.json();
  if (!response.ok) return NextResponse.json({ error: json?.error?.message || "Page 조회 실패" }, { status: 400 });
  const page = (json?.data as MetaPage[] | undefined)?.find((item) => item.id === pageId);
  if (!page?.id || !page.access_token) {
    return NextResponse.json({ error: "선택한 Page에 게시 권한이 없습니다." }, { status: 400 });
  }
  const connection: MetaConnection = {
    userAccessToken: pending.userAccessToken,
    pageId: page.id,
    pageName: page.name || "Facebook Page",
    pageAccessToken: page.access_token,
    instagramUserId: page.instagram_business_account?.id,
    instagramUsername: page.instagram_business_account?.username,
  };
  await setConnection("meta", connection);
  await clearConnection("meta_pending");
  return NextResponse.json({
    ok: true,
    pageName: connection.pageName,
    instagramUsername: connection.instagramUsername || null,
  });
}
