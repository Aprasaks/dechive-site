import { defineQuery } from "next-sanity";
import { cache } from "react";

import { sanityFetch } from "./live";
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
  const { data } = await sanityFetch({ query: aiUpdatesQuery });

  return data as AiUpdateSummary[];
});

export const getAiUpdate = cache(async (slug: string) => {
  const { data } = await sanityFetch({
    query: aiUpdateQuery,
    params: { slug },
  });

  return data as AiUpdatePost | null;
});
