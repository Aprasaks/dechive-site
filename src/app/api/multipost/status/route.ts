import { NextResponse } from "next/server";
import {
  getConnection,
  type MetaConnection,
  type MetaPendingConnection,
  type ThreadsConnection,
  type TikTokConnection,
} from "@/lib/multipost/session";

type MetaPage = {
  id?: string;
  name?: string;
  instagram_business_account?: { id?: string; username?: string };
};

async function pendingPages(pending: MetaPendingConnection | null) {
  if (!pending?.userAccessToken) return [];
  const version = process.env.META_GRAPH_VERSION || "v24.0";
  const url = new URL(`https://graph.facebook.com/${version}/me/accounts`);
  url.searchParams.set("fields", "id,name,instagram_business_account{id,username}");
  url.searchParams.set("access_token", pending.userAccessToken);
  const response = await fetch(url, { cache: "no-store" });
  const json = await response.json();
  if (!response.ok || !Array.isArray(json?.data)) return [];
  return (json.data as MetaPage[]).filter((page) => page.id).map((page) => ({
    id: String(page.id),
    name: page.name || "Facebook Page",
    instagramUsername: page.instagram_business_account?.username || null,
    hasInstagram: Boolean(page.instagram_business_account?.id),
  }));
}

export async function GET() {
  const [meta, pending, threads, tiktok] = await Promise.all([
    getConnection<MetaConnection>("meta"),
    getConnection<MetaPendingConnection>("meta_pending"),
    getConnection<ThreadsConnection>("threads"),
    getConnection<TikTokConnection>("tiktok"),
  ]);
  return NextResponse.json({
    config: {
      meta: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
      threads: Boolean(process.env.THREADS_APP_ID && process.env.THREADS_APP_SECRET),
      tiktok: Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),
      blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN),
      appSecret: Boolean(process.env.MULTIPOST_APP_SECRET && process.env.MULTIPOST_APP_SECRET.length >= 32),
    },
    meta: meta ? {
      connected: true,
      pageId: meta.pageId,
      pageName: meta.pageName,
      instagram: meta.instagramUsername || null,
      instagramReady: Boolean(meta.instagramUserId),
    } : { connected: false },
    metaPending: meta ? null : { pages: await pendingPages(pending) },
    threads: threads ? { connected: true, userId: threads.userId } : { connected: false },
    tiktok: tiktok ? { connected: true, openId: tiktok.openId || null } : { connected: false },
  });
}
