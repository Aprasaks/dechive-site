import { defineQuery } from "next-sanity";
import { cache } from "react";

import { client } from "./client";
import type { KnowledgePost, KnowledgeSummary } from "./types";

const publishedFilter = `
  _type == "knowledge" &&
  status == "published" &&
  humanVerified == true &&
  defined(slug.current)
`;

const imageProjection = `{
  ...,
  asset->{
    _id,
    url,
    metadata {
      lqip,
      dimensions
    }
  }
}`;

const knowledgePostsQuery = defineQuery(`
  *[${publishedFilter}] | order(publishedAt desc) {
    _id,
    title,
    summary,
    "slug": slug.current,
    publishedAt,
    "category": category->title,
    keywords,
    thumbnail ${imageProjection},
    "bodyText": pt::text(body)
  }
`);

const knowledgePostQuery = defineQuery(`
  *[${publishedFilter} && slug.current == $slug][0] {
    _id,
    title,
    summary,
    "slug": slug.current,
    publishedAt,
    "category": category->title,
    keywords,
    thumbnail ${imageProjection},
    body[] {
      ...,
      _type == "bodyImage" => ${imageProjection}
    },
    "bodyText": pt::text(body)
  }
`);

export const getKnowledgePosts = cache(async () => {
  return client.fetch<KnowledgeSummary[]>(
    knowledgePostsQuery,
    {},
    {
      perspective: "published",
      useCdn: false,
      next: { revalidate: 60, tags: ["knowledge"] },
    },
  );
});

export const getKnowledgePost = cache(async (slug: string) => {
  return client.fetch<KnowledgePost | null>(
    knowledgePostQuery,
    { slug },
    {
      perspective: "published",
      useCdn: false,
      next: { revalidate: 60, tags: [`knowledge:${slug}`] },
    },
  );
});
