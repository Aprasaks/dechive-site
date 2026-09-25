import { defineQuery } from "next-sanity";
import { cache } from "react";

import { client } from "./client";
import type { AiUpdatePost, AiUpdateSummary } from "./types";

const publishedFilter = `
  _type == "aiUpdate" &&
  status == "published" &&
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

const aiUpdatesQuery = defineQuery(`
  *[${publishedFilter}] | order(publishedAt desc) {
    _id,
    title,
    summary,
    "slug": slug.current,
    publishedAt,
    thumbnail ${imageProjection},
    "bodyText": pt::text(body) + " " + pt::text(changes) + " " + pt::text(possibilities)
  }
`);

const aiUpdateQuery = defineQuery(`
  *[${publishedFilter} && slug.current == $slug][0] {
    _id,
    title,
    summary,
    "slug": slug.current,
    publishedAt,
    thumbnail ${imageProjection},
    body[] {
      ...,
      _type == "relatedImage" => ${imageProjection}
    },
    changes,
    possibilities,
    officialLink,
    officialLinkLabel,
    "bodyText": pt::text(body) + " " + pt::text(changes) + " " + pt::text(possibilities)
  }
`);

export const getAiUpdates = cache(async () => {
  return client.fetch<AiUpdateSummary[]>(
    aiUpdatesQuery,
    {},
    {
      perspective: "published",
      useCdn: false,
      next: { revalidate: 60, tags: ["ai-update"] },
    },
  );
});

export const getAiUpdate = cache(async (slug: string) => {
  return client.fetch<AiUpdatePost | null>(
    aiUpdateQuery,
    { slug },
    {
      perspective: "published",
      useCdn: false,
      next: { revalidate: 60, tags: [`ai-update:${slug}`] },
    },
  );
});
