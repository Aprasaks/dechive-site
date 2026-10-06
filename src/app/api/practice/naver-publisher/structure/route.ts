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

const GEMINI_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      description:
        "Final reading order for the Naver blog preview. Use every paragraph exactly once and every image exactly once.",
      items: {
        type: "object",
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

function quoteCandidateScore(content: string) {
  const compact = content.replace(/\s+/g, " ").trim();

  if (
    compact.length < 24 ||
    compact.length > 170 ||
    /[?？]$/.test(compact) ||
    /^(?:안녕하세요|예를 들어|다음|이번 글|이제 )/.test(compact)
  ) {
    return -1;
  }

  let score = 0;

  if (compact.length >= 38 && compact.length <= 125) score += 3;
  if (
    /(?:핵심|중요|결국|즉[, ]|한마디로|다시 말해|정리하면|기억|차이는|목표는|의미합니다|것입니다|아닙니다|가깝습니다|서로 다른|오해|강력한 이유|기준이 돼야|핵심입니다)/.test(
      compact,
    )
  ) {
    score += 5;
  }
  if (
    /(?:아니라|하지만|따라서|그래서|보다|때문입니다|필요합니다|뜻입니다|말합니다)/.test(
      compact,
    )
  ) {
    score += 2;
  }

  const sentenceCount = compact
    .split(/[.!。！？]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;

  if (sentenceCount <= 1) score += 2;
  if (sentenceCount >= 3) score -= 3;

  return score;
}

function ensureQuoteItems(
  items: StructureItem[],
  paragraphs: string[],
): StructureItem[] {
  const existingQuoteCount = items.filter((item) => item.type === "quote").length;
  const targetQuoteCount = paragraphs.length >= 18 ? 2 : paragraphs.length >= 6 ? 1 : 0;

  if (existingQuoteCount >= targetQuoteCount || targetQuoteCount === 0) {
    return items;
  }

  const candidates = items
    .map((item, orderIndex) => ({
      item,
      orderIndex,
      score:
        item.type === "paragraph"
          ? quoteCandidateScore(paragraphs[item.paragraphIndex] || "")
          : -1,
    }))
    .filter(({ score }) => score >= 4)
    .sort((a, b) => b.score - a.score);

  const selectedParagraphIndexes = new Set<number>();

  for (const candidate of candidates) {
    if (
      existingQuoteCount + selectedParagraphIndexes.size >=
      targetQuoteCount
    ) {
      break;
    }

    const paragraphIndex = candidate.item.paragraphIndex;
    const tooClose = [...selectedParagraphIndexes].some(
      (selected) => Math.abs(selected - paragraphIndex) < 4,
    );

    if (tooClose && candidates.length > targetQuoteCount) continue;
    selectedParagraphIndexes.add(paragraphIndex);
  }

  if (selectedParagraphIndexes.size === 0) return items;

  return items.map((item) =>
    item.type === "paragraph" &&
    selectedParagraphIndexes.has(item.paragraphIndex)
      ? { ...item, type: "quote" as const }
      : item,
  );
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
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!geminiApiKey && !openRouterApiKey) {
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

  const openRouterContent: Array<Record<string, unknown>> = [
    { type: "text", text: prompt },
  ];
  const geminiParts: Array<Record<string, unknown>> = [{ text: prompt }];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const dataUrl = String(image.dataUrl || "").trim();
    if (!dataUrl.startsWith("data:image/")) continue;

    openRouterContent.push({
      type: "text",
      text: `IMAGE_INDEX=${index} FILE=${String(image.fileName || "image")}`,
    });
    openRouterContent.push({
      type: "image_url",
      image_url: { url: dataUrl },
    });

    const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!match) continue;

    geminiParts.push({
      text: `IMAGE_INDEX=${index} FILE=${String(image.fileName || "image")}`,
    });
    geminiParts.push({
      inlineData: {
        mimeType: match[1],
        data: match[2],
      },
    });
  }

  const geminiModels = Array.from(
    new Set([
      process.env.GEMINI_MODEL || "gemini-3.8-flash",
      "gemini-3.5-flash",
    ]),
  );
  const openRouterModel =
    process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";

  const requestGemini = (
    model: string,
    useStructuredOutput: boolean,
  ) => {
    if (!geminiApiKey) return null;

    return fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": geminiApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: geminiParts,
            },
          ],
          generationConfig: {
            temperature: 0.1,
            ...(useStructuredOutput
              ? {
                  responseMimeType: "application/json",
                  responseSchema: GEMINI_OUTPUT_SCHEMA,
                }
              : {}),
          },
        }),
      },
    );
  };

  const requestOpenRouter = (useStructuredOutput: boolean) => {
    if (!openRouterApiKey) return null;

    return fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://dechive.dev",
        "X-Title": "DECHIVE NAVER PUBLISHER",
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: "user",
            content: openRouterContent,
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
  };

  const finalize = (
    rawItems: unknown,
    provider: "gemini" | "openrouter",
    model: string,
  ) => {
    const items = ensureQuoteItems(
      normalizeItems(rawItems, paragraphs.length, images.length),
      paragraphs,
    );

    return NextResponse.json({
      items,
      mode: "ai",
      provider,
      model,
      editorial: {
        quotes: items.filter((item) => item.type === "quote").length,
        dividers: items.filter((item) => item.type === "divider").length,
        headings: items.filter((item) => item.type === "heading").length,
      },
    });
  };

  if (geminiApiKey) {
    for (const geminiModel of geminiModels) {
      try {
        let response = await requestGemini(geminiModel, true);

        if (
          response &&
          !response.ok &&
          (response.status === 400 || response.status === 422)
        ) {
          const structuredDetail = await response.text();
          console.warn(
            "Gemini structured output unavailable; retrying JSON-only prompt",
            geminiModel,
            response.status,
            structuredDetail,
          );
          response = await requestGemini(geminiModel, false);
        }

        if (response?.ok) {
          const payload = (await response.json()) as {
            candidates?: Array<{
              content?: {
                parts?: Array<{
                  text?: string;
                }>;
              };
            }>;
          };

          const text = payload.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || "")
            .join("")
            .trim();

          if (text) {
            const parsed = parseJsonResponse(text);
            return finalize(parsed.items, "gemini", geminiModel);
          }

          console.warn("Gemini structure response was empty", geminiModel);
        } else if (response) {
          const detail = await response.text();
          console.warn(
            "Gemini structure request failed",
            geminiModel,
            response.status,
            detail,
          );
        }
      } catch (error) {
        console.warn(
          "Gemini structure route error; trying next provider",
          geminiModel,
          error,
        );
      }
    }
  }

  if (openRouterApiKey) {
    try {
      let response = await requestOpenRouter(true);

      if (
        response &&
        !response.ok &&
        (response.status === 400 || response.status === 422)
      ) {
        const structuredDetail = await response.text();
        console.warn(
          "OpenRouter structured output unavailable; retrying JSON-only prompt",
          response.status,
          structuredDetail,
        );
        response = await requestOpenRouter(false);
      }

      if (response?.ok) {
        const payload = (await response.json()) as {
          choices?: Array<{
            message?: {
              content?: string;
            };
          }>;
        };

        const text = payload.choices?.[0]?.message?.content?.trim();

        if (text) {
          const parsed = parseJsonResponse(text);
          return finalize(parsed.items, "openrouter", openRouterModel);
        }

        console.warn("OpenRouter structure response was empty");
      } else if (response) {
        const detail = await response.text();
        console.warn(
          "OpenRouter structure request failed",
          response.status,
          detail,
        );
      }
    } catch (error) {
      console.warn("OpenRouter structure route error", error);
    }
  }

  return NextResponse.json({ error: "AI_REQUEST_FAILED" }, { status: 502 });

}
