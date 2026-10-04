import { NextResponse } from "next/server";

type StructureRequest = {
  title?: string;
  paragraphs?: string[];
  images?: Array<{
    index: number;
    fileName?: string;
    dataUrl: string;
  }>;
};

type StructureItem = {
  type: "paragraph" | "heading" | "quote" | "divider" | "image";
  paragraphIndex: number;
  imageIndex: number;
};

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      description:
        "Final reading order for the Naver blog preview. Use every paragraph exactly once and every image exactly once.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: ["paragraph", "heading", "quote", "divider", "image"],
          },
          paragraphIndex: {
            type: "integer",
            description:
              "Zero-based paragraph index. Use -1 for divider and image items.",
          },
          imageIndex: {
            type: "integer",
            description:
              "Zero-based image index. Use -1 for paragraph, heading, quote and divider items.",
          },
        },
        required: ["type", "paragraphIndex", "imageIndex"],
      },
    },
  },
  required: ["items"],
};

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function normalizeItems(
  rawItems: unknown,
  paragraphCount: number,
  imageCount: number,
): StructureItem[] {
  if (!Array.isArray(rawItems)) return [];

  const result: StructureItem[] = [];
  const usedParagraphs = new Set<number>();
  const usedImages = new Set<number>();

  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Partial<StructureItem>;
    const type = item.type;

    if (
      type !== "paragraph" &&
      type !== "heading" &&
      type !== "quote" &&
      type !== "divider" &&
      type !== "image"
    ) {
      continue;
    }

    if (type === "divider") {
      if (result.length === 0 || result[result.length - 1]?.type === "divider") {
        continue;
      }
      result.push({ type, paragraphIndex: -1, imageIndex: -1 });
      continue;
    }

    if (type === "image") {
      const imageIndex = Number(item.imageIndex);
      if (
        !Number.isInteger(imageIndex) ||
        imageIndex < 0 ||
        imageIndex >= imageCount ||
        usedImages.has(imageIndex)
      ) {
        continue;
      }
      usedImages.add(imageIndex);
      result.push({ type, paragraphIndex: -1, imageIndex });
      continue;
    }

    const paragraphIndex = Number(item.paragraphIndex);
    if (
      !Number.isInteger(paragraphIndex) ||
      paragraphIndex < 0 ||
      paragraphIndex >= paragraphCount ||
      usedParagraphs.has(paragraphIndex)
    ) {
      continue;
    }

    usedParagraphs.add(paragraphIndex);
    result.push({ type, paragraphIndex, imageIndex: -1 });
  }

  for (let index = 0; index < paragraphCount; index += 1) {
    if (!usedParagraphs.has(index)) {
      result.push({
        type: "paragraph",
        paragraphIndex: index,
        imageIndex: -1,
      });
    }
  }

  for (let index = 0; index < imageCount; index += 1) {
    if (!usedImages.has(index)) {
      result.push({ type: "image", paragraphIndex: -1, imageIndex: index });
    }
  }

  while (result[result.length - 1]?.type === "divider") {
    result.pop();
  }

  return result;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  let body: StructureRequest;
  try {
    body = (await request.json()) as StructureRequest;
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  const paragraphs = Array.isArray(body.paragraphs)
    ? body.paragraphs.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
  const images = Array.isArray(body.images) ? body.images.slice(0, 12) : [];

  if (!title || paragraphs.length === 0) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const prompt = [
    "You are the layout editor for DECHIVE NAVER PUBLISHER v1.0.",
    "Your job is NOT to rewrite or generate the user's writing.",
    "You only decide how the existing paragraphs and uploaded images should be arranged for a readable Korean Naver Blog post.",
    "",
    "Rules:",
    "1. Every paragraph index must appear exactly once.",
    "2. Never invent, merge, split, summarize, or rewrite text. Return indexes only.",
    "3. Classify a paragraph as heading only when that paragraph itself clearly functions as a section heading.",
    "4. Classify 1 to 3 strong takeaway sentences as quote when useful. A quote should be a meaningful conclusion, key insight, or memorable sentence, not a random sentence.",
    "5. Insert divider items only at meaningful topic transitions. Usually before a new major section. Avoid decorative overuse.",
    "6. Inspect each image and place it near the paragraph or section whose meaning best matches the image.",
    "7. Every uploaded image must appear exactly once. Do not place all images at the end unless that is genuinely the best match.",
    "8. Keep the overall paragraph order. Images and dividers may be inserted between paragraphs.",
    "9. The result should feel like a clean Naver Blog article that a human editor would approve.",
    "",
    `TITLE: ${title}`,
    "",
    "PARAGRAPHS:",
    ...paragraphs.map((paragraph, index) => `[${index}] ${paragraph}`),
    "",
    `There are ${images.length} uploaded images. Image parts follow in index order.`,
  ].join("\n");

  const parts: Array<Record<string, unknown>> = [{ text: prompt }];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const parsed = parseDataUrl(String(image.dataUrl || ""));
    if (!parsed) continue;

    parts.push({
      text: `IMAGE_INDEX=${index} FILE=${String(image.fileName || "image")}`,
    });
    parts.push({
      inlineData: {
        mimeType: parsed.mimeType,
        data: parsed.data,
      },
    });
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseFormat: {
              text: {
                mimeType: "application/json",
                schema: OUTPUT_SCHEMA,
              },
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("Gemini structure request failed", response.status, detail);
      return NextResponse.json(
        { error: "AI_REQUEST_FAILED" },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      return NextResponse.json({ error: "AI_EMPTY_RESPONSE" }, { status: 502 });
    }

    const parsed = JSON.parse(text) as { items?: unknown };
    const items = normalizeItems(
      parsed.items,
      paragraphs.length,
      images.length,
    );

    return NextResponse.json({ items, mode: "ai" });
  } catch (error) {
    console.error("Gemini structure route error", error);
    return NextResponse.json({ error: "AI_REQUEST_FAILED" }, { status: 502 });
  }
}
