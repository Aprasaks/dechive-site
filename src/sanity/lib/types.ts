import type { PortableTextBlock } from "@portabletext/types";

type ImageDimensions = {
  aspectRatio: number;
  height: number;
  width: number;
};

export type KnowledgeImage = {
  _key?: string;
  _type: "image" | "bodyImage";
  alt: string;
  caption?: string;
  crop?: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  hotspot?: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
  asset: {
    _id: string;
    url: string;
    metadata: {
      dimensions: ImageDimensions;
      lqip?: string;
    };
  };
};

export type KnowledgeBodyImage = KnowledgeImage & {
  _key: string;
  _type: "bodyImage";
};

type KnowledgeCodeBlock = {
  _key: string;
  _type: "code";
  code?: string;
  filename?: string;
  language?: string;
};

export type KnowledgeBodyBlock =
  PortableTextBlock | KnowledgeBodyImage | KnowledgeCodeBlock;

export type KnowledgeSummary = {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  publishedAt: string;
  category?: string;
  keywords: string[];
  thumbnail: KnowledgeImage;
  bodyText: string;
};

export type KnowledgePost = KnowledgeSummary & {
  body: KnowledgeBodyBlock[];
};
