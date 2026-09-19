import type { SanityImageSource } from "@sanity/image-url";

import { urlFor } from "./image";
import type { KnowledgeImage } from "./types";

export function knowledgeImageUrl(
  image: KnowledgeImage,
  width: number,
  height?: number,
) {
  const builder = urlFor(image as SanityImageSource)
    .width(width)
    .fit("crop")
    .auto("format");

  return height ? builder.height(height).url() : builder.url();
}
