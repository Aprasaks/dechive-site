import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Next.js handles caching through Sanity Live and ISR. Reading from the
  // origin prevents a stale Sanity CDN response from hiding new publications.
  useCdn: false,
});
