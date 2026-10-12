import { getKnowledgePosts } from "@/sanity/lib/knowledge";

export const revalidate = 60;

const SITE_ORIGIN = "https://dechive.dev";
const MAX_RSS_ITEMS = 100;

function escapeXml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&apos;");
}

export async function GET() {
  const posts = (await getKnowledgePosts()).slice(0, MAX_RSS_ITEMS);
  const lastBuildDate = posts[0]?.publishedAt ?? new Date(0).toISOString();
  const items = posts
    .map((post) => {
      const url = `${SITE_ORIGIN}/knowledge/${post.slug}`;
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<description>${escapeXml(post.summary)}</description>`,
        `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`,
        "</item>",
      ].join("");
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    "<title>DECHIVE Knowledge</title>",
    `<link>${SITE_ORIGIN}/knowledge</link>`,
    "<description>질문하고 확인하며 쌓아가는 DECHIVE의 지식 아카이브</description>",
    "<language>ko</language>",
    `<lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
