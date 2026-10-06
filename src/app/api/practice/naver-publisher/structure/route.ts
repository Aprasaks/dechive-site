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

function parseJsonResponse(value: string) {
  const trimmed = value.trim();
  const unwrapped = trimmed
    .replace(/^\`\`\`(?:json)?\s*/i, "")
    .replace(/\s*\`\`\`$/, "")
    .trim();

  return JSON.parse(unwrapped) as { items?: unknown };
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
  const apiKey = process.env.OPENROUTER_API_KEY;
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
    "4. You MUST classify 1 to 3 strong takeaway paragraphs as quote for a normal-length article. For articles with 12 or more paragraphs, target 2 quotes. Use zero quotes only when there is genuinely no suitable standalone takeaway. A quote should be a meaningful conclusion, key insight, or memorable sentence, not a random sentence.",
    "5. Insert divider items only at meaningful topic transitions. Usually before a new major section. Avoid decorative overuse.",
    "6. Inspect each image and place it near the paragraph or section whose meaning best matches the image.",
    "7. Every uploaded image must appear exactly once. Do not place all images at the end unless that is genuinely the best match.",
    "8. Keep the overall paragraph order. Images and dividers may be inserted between paragraphs.",
    "9. The result should feel like a clean Naver Blog article that a human editor would approve.",
    "10. Return ONLY a valid JSON object matching the requested schema. Do not use markdown fences or explanatory text.",
    "",
    `TITLE: ${title}`,
    "",
    "PARAGRAPHS:",
    ...paragraphs.map((paragraph, index) => `[${index}] ${paragraph}`),
    "",
    `There are ${images.length} uploaded images. Image parts follow in index order.`,
  ].join("\n");

  const content: Array<Record<string, unknown>> = [
    { type: "text", text: prompt },
  ];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const dataUrl = String(image.dataUrl || "").trim();
    if (!dataUrl.startsWith("data:image/")) continue;

    content.push({
      type: "text",
      text: `IMAGE_INDEX=${index} FILE=${String(image.fileName || "image")}`,
    });
    content.push({
      type: "image_url",
      image_url: { url: dataUrl },
    });
  }

  // Keep the provider swappable; v1 defaults to OpenRouter's free Gemma vision model.
  const model =
    process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";

  const requestOpenRouter = (useStructuredOutput: boolean) =>
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://dechive.dev",
        "X-Title": "DECHIVE NAVER PUBLISHER",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content,
          },
        ],
        temperature: 0.1,
        ...(useStructuredOutput
          ? {
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "naver_publisher_structure",
                  strict: true,
                  schema: OUTPUT_SCHEMA,
                },
              },
            }
          : {}),
      }),
    });

  try {
    let response = await requestOpenRouter(true);

    if (!response.ok && (response.status === 400 || response.status === 422)) {
      const structuredDetail = await response.text();
      console.warn(
        "OpenRouter structured output unavailable; retrying JSON-only prompt",
        response.status,
        structuredDetail,
      );
      response = await requestOpenRouter(false);
    }

    if (!response.ok) {
      const detail = await response.text();
      console.error(
        "OpenRouter structure request failed",
        response.status,
        detail,
      );
      return NextResponse.json(
        { error: "AI_REQUEST_FAILED" },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const text = payload.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return NextResponse.json({ error: "AI_EMPTY_RESPONSE" }, { status: 502 });
    }

    const parsed = parseJsonResponse(text);
    const items = normalizeItems(
      parsed.items,
      paragraphs.length,
      images.length,
    );

    return NextResponse.json({
      items,
      mode: "ai",
      provider: "openrouter",
      model,
    });
  } catch (error) {
    console.error("OpenRouter structure route error", error);
    return NextResponse.json({ error: "AI_REQUEST_FAILED" }, { status: 502 });
  }
}
