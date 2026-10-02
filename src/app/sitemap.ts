import type { MetadataRoute } from "next";
import { defineQuery } from "next-sanity";

import { practices } from "@/data/practices";
import { client } from "@/sanity/lib/client";

const SITE_URL = "https://dechive.dev";

const sitemapContentQuery = defineQuery(`{
  "knowledge": *[
    _type == "knowledge" &&
    status == "published" &&
    humanVerified == true &&
    defined(slug.current)
  ] {
    "slug": slug.current,
    "lastModified": _updatedAt
  },
  "aiUpdates": *[
    _type == "aiUpdate" &&
    status == "published" &&
    defined(slug.current)
  ] {
    "slug": slug.current,
    "lastModified": _updatedAt
  }
}`);

type SitemapDocument = {
  slug: string;
  lastModified: string;
};

type SitemapContent = {
  knowledge: SitemapDocument[];
  aiUpdates: SitemapDocument[];
};

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await client.fetch<SitemapContent>(
    sitemapContentQuery,
    {},
    {
      perspective: "published",
      useCdn: false,
      next: { revalidate, tags: ["sitemap"] },
    },
  );

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/knowledge`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ai-update`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/practice`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...practices.map((practice) => ({
      url: `${SITE_URL}${practice.detailHref}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    {
      url: `${SITE_URL}/practice/sns-sales`,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}/books`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const knowledgePages: MetadataRoute.Sitemap = content.knowledge.map(
    (post) => ({
      url: `${SITE_URL}/knowledge/${post.slug}`,
      lastModified: post.lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  const aiUpdatePages: MetadataRoute.Sitemap = content.aiUpdates.map(
    (post) => ({
      url: `${SITE_URL}/ai-update/${post.slug}`,
      lastModified: post.lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    }),
  );

  return [...staticPages, ...knowledgePages, ...aiUpdatePages];
}
