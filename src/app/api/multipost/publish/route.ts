import { NextRequest, NextResponse } from "next/server";
import {
  getConnection,
  type MetaConnection,
  type ThreadsConnection,
  type TikTokConnection,
} from "@/lib/multipost/session";

type Body = {
  videoUrl: string;
  title?: string;
  text?: string;
  platforms: string[];
  tiktokPrivacy?: string;
};

type Result = {
  platform: string;
  status: "published" | "submitted" | "failed";
  id?: string;
  message?: string;
};

async function publishInstagram(meta: MetaConnection, body: Body): Promise<Result> {
  if (!meta.instagramUserId) {
    return { platform: "instagram", status: "failed", message: "Instagram Professional 계정이 연결되지 않았습니다." };
  }
  const version = process.env.META_GRAPH_VERSION || "v24.0";
  const create = new URL(`https://graph.facebook.com/${version}/${meta.instagramUserId}/media`);
  create.searchParams.set("media_type", "REELS");
  create.searchParams.set("video_url", body.videoUrl);
  create.searchParams.set("caption", [body.title, body.text].filter(Boolean).join("\n\n"));
  create.searchParams.set("access_token", meta.pageAccessToken);
  const createResponse = await fetch(create, { method: "POST" });
  const created = await createResponse.json();
  if (!createResponse.ok || !created.id) {
    return { platform: "instagram", status: "failed", message: JSON.stringify(created) };
  }

  for (let index = 0; index < 18; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const statusUrl = new URL(`https://graph.facebook.com/${version}/${created.id}`);
    statusUrl.searchParams.set("fields", "status_code,status");
    statusUrl.searchParams.set("access_token", meta.pageAccessToken);
    const statusResponse = await fetch(statusUrl);
    const statusJson = await statusResponse.json();
    if (statusJson.status_code === "FINISHED") break;
    if (statusJson.status_code === "ERROR" || statusJson.status_code === "EXPIRED") {
      return { platform: "instagram", status: "failed", message: statusJson.status || statusJson.status_code };
    }
    if (index === 17) {
      return { platform: "instagram", status: "submitted", id: created.id, message: "Instagram에서 영상을 처리 중입니다." };
    }
  }

  const publishUrl = new URL(`https://graph.facebook.com/${version}/${meta.instagramUserId}/media_publish`);
  publishUrl.searchParams.set("creation_id", created.id);
  publishUrl.searchParams.set("access_token", meta.pageAccessToken);
  const publishResponse = await fetch(publishUrl, { method: "POST" });
  const published = await publishResponse.json();
  return publishResponse.ok && published.id
    ? { platform: "instagram", status: "published", id: published.id }
    : { platform: "instagram", status: "failed", message: JSON.stringify(published) };
}

async function publishFacebook(meta: MetaConnection, body: Body): Promise<Result> {
  const version = process.env.META_GRAPH_VERSION || "v24.0";
  const startUrl = new URL(`https://graph.facebook.com/${version}/${meta.pageId}/video_reels`);
  startUrl.searchParams.set("upload_phase", "start");
  startUrl.searchParams.set("access_token", meta.pageAccessToken);
  const startResponse = await fetch(startUrl, { method: "POST" });
  const started = await startResponse.json();
  if (!startResponse.ok || !started.video_id || !started.upload_url) {
    return { platform: "facebook", status: "failed", message: JSON.stringify(started) };
  }

  const uploadResponse = await fetch(started.upload_url, {
    method: "POST",
    headers: {
      Authorization: `OAuth ${meta.pageAccessToken}`,
      file_url: body.videoUrl,
    },
  });
  if (!uploadResponse.ok) {
    return { platform: "facebook", status: "failed", message: await uploadResponse.text() };
  }

  const finishUrl = new URL(`https://graph.facebook.com/${version}/${meta.pageId}/video_reels`);
  finishUrl.searchParams.set("access_token", meta.pageAccessToken);
  finishUrl.searchParams.set("video_id", started.video_id);
  finishUrl.searchParams.set("upload_phase", "finish");
  finishUrl.searchParams.set("video_state", "PUBLISHED");
  if (body.title) finishUrl.searchParams.set("title", body.title);
  if (body.text) finishUrl.searchParams.set("description", body.text);
  const finishResponse = await fetch(finishUrl, { method: "POST" });
  const finished = await finishResponse.json();
  return finishResponse.ok && finished.success
    ? { platform: "facebook", status: "submitted", id: started.video_id, message: "Facebook이 Reel 게시 요청을 접수했습니다." }
    : { platform: "facebook", status: "failed", message: JSON.stringify(finished) };
}

async function publishThreads(connection: ThreadsConnection, body: Body): Promise<Result> {
  const createUrl = new URL("https://graph.threads.net/me/threads");
  createUrl.searchParams.set("media_type", "VIDEO");
  createUrl.searchParams.set("video_url", body.videoUrl);
  createUrl.searchParams.set("text", [body.title, body.text].filter(Boolean).join("\n\n"));
  const createResponse = await fetch(createUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${connection.accessToken}` },
  });
  const created = await createResponse.json();
  if (!createResponse.ok || !created.id) {
    return { platform: "threads", status: "failed", message: JSON.stringify(created) };
  }

  await new Promise((resolve) => setTimeout(resolve, 4000));
  const publishUrl = new URL("https://graph.threads.net/me/threads_publish");
  publishUrl.searchParams.set("creation_id", created.id);
  const publishResponse = await fetch(publishUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${connection.accessToken}` },
  });
  const published = await publishResponse.json();
  return publishResponse.ok && published.id
    ? { platform: "threads", status: "published", id: published.id }
    : { platform: "threads", status: "failed", message: JSON.stringify(published) };
}

async function publishTikTok(connection: TikTokConnection, body: Body): Promise<Result> {
  const creatorResponse = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    },
  );
  const creator = await creatorResponse.json();
  if (!creatorResponse.ok || creator?.error?.code !== "ok") {
    return { platform: "tiktok", status: "failed", message: JSON.stringify(creator) };
  }
  const allowed = creator?.data?.privacy_level_options || [];
  const privacy = allowed.includes(body.tiktokPrivacy)
    ? body.tiktokPrivacy
    : allowed[0] || "SELF_ONLY";

  const initResponse = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: [body.title, body.text].filter(Boolean).join("\n\n").slice(0, 2000),
          privacy_level: privacy,
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: body.videoUrl,
        },
      }),
    },
  );
  const initialized = await initResponse.json();
  return initResponse.ok && initialized?.data?.publish_id
    ? { platform: "tiktok", status: "submitted", id: initialized.data.publish_id, message: "TikTok 게시 요청이 접수되었습니다." }
    : { platform: "tiktok", status: "failed", message: JSON.stringify(initialized) };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  if (!body.videoUrl || !Array.isArray(body.platforms) || body.platforms.length === 0) {
    return NextResponse.json({ error: "영상과 플랫폼을 선택하세요." }, { status: 400 });
  }

  const [meta, threads, tiktok] = await Promise.all([
    getConnection<MetaConnection>("meta"),
    getConnection<ThreadsConnection>("threads"),
    getConnection<TikTokConnection>("tiktok"),
  ]);

  const results = await Promise.all(
    body.platforms.map(async (platform) => {
      try {
        if (platform === "facebook") {
          return meta
            ? publishFacebook(meta, body)
            : { platform, status: "failed" as const, message: "Meta 계정을 연결하세요." };
        }
        if (platform === "instagram") {
          return meta
            ? publishInstagram(meta, body)
            : { platform, status: "failed" as const, message: "Meta 계정을 연결하세요." };
        }
        if (platform === "threads") {
          return threads
            ? publishThreads(threads, body)
            : { platform, status: "failed" as const, message: "Threads 계정을 연결하세요." };
        }
        if (platform === "tiktok") {
          return tiktok
            ? publishTikTok(tiktok, body)
            : { platform, status: "failed" as const, message: "TikTok 계정을 연결하세요." };
        }
        return { platform, status: "failed" as const, message: "지원하지 않는 플랫폼입니다." };
      } catch (error) {
        return {
          platform,
          status: "failed" as const,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
  );

  return NextResponse.json({ results });
}
