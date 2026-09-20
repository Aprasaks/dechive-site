import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";

import { knowledgeImageUrl } from "@/sanity/lib/knowledge-image";
import type {
  AiUpdateBodyBlock,
  AiUpdateRelatedImage,
} from "@/sanity/lib/types";

type AiUpdateBodyProps = {
  value: AiUpdateBodyBlock[] | PortableTextBlock[];
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-6 text-[15px] leading-8 opacity-82 sm:text-base">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="font-editorial mt-12 mb-5 text-3xl leading-tight font-semibold tracking-[-0.025em]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-editorial mt-9 mb-4 text-2xl leading-snug font-semibold">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-[var(--terracotta)] py-1 pl-5 text-lg leading-8 font-semibold">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 list-disc space-y-2 pl-6 text-[15px] leading-7 opacity-82 sm:text-base">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6 text-[15px] leading-7 opacity-82 sm:text-base">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const link = value as { href?: string; openInNewTab?: boolean };
      const isExternal = link.href?.startsWith("http");
      const openInNewTab = link.openInNewTab && isExternal;

      return (
        <a
          href={link.href}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noreferrer noopener" : undefined}
          className="font-semibold text-[var(--terracotta)] underline decoration-1 underline-offset-4"
        >
          {children}
        </a>
      );
    },
    code: ({ children }) => (
      <code className="bg-[color:rgb(9_41_68_/_7%)] px-1.5 py-0.5 text-[0.9em]">
        {children}
      </code>
    ),
  },
  types: {
    relatedImage: ({ value }) => {
      const image = value as AiUpdateRelatedImage;

      return (
        <figure className="my-10">
          <Image
            src={knowledgeImageUrl(image, 1400)}
            alt={image.alt}
            width={1400}
            height={Math.round(
              1400 / (image.asset.metadata.dimensions.aspectRatio || 1.5),
            )}
            sizes="(min-width: 768px) 800px, 100vw"
            className="h-auto w-full border border-[color:rgb(9_41_68_/_14%)]"
          />
          {image.caption ? (
            <figcaption className="mt-2 text-xs leading-5 opacity-50">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export function AiUpdateBody({ value }: AiUpdateBodyProps) {
  return <PortableText value={value} components={components} />;
}
