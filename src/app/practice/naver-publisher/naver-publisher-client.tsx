"use client";

import { useEffect, useState, useTransition } from "react";

type BlockType =
  "title" | "heading" | "paragraph" | "quote" | "divider" | "image";

type DraftBlock = {
  id: string;
  type: BlockType;
  content: string;
  fileName?: string;
  dataUrl?: string;
};

const blockLabels: Record<BlockType, string> = {
  title: "제목",
  heading: "큰 제목",
  paragraph: "본문",
  quote: "인용구",
  divider: "구분선",
  image: "이미지",
};

const editableBlockTypes: readonly BlockType[] = [
  "paragraph",
  "heading",
  "quote",
];

type BridgeState = "checking" | "ready" | "naver-missing" | "missing";

type BridgeReply = {
  ok?: boolean;
  error?: string;
  result?: {
    build?: string;
    naverReady?: boolean;
    imageRequestedCount?: number;
    imageInsertedCount?: number;
    draftSave?: { clicked?: boolean };
  };
};

const WEB_SOURCE = "DECHIVE_PUBLISHER_WEB";
const BRIDGE_SOURCE = "DECHIVE_NAVER_BRIDGE";

function escapeNaverHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildNaverPayload(
  title: string,
  blocks: DraftBlock[],
  bodyTags: string[],
) {
  const html: string[] = [];
  const text: string[] = [];
  const images: Array<{
    dataUrl: string;
    alt: string;
    slot: string;
    sequence: number;
  }> = [];
  let captionCount = 0;

  for (const block of blocks) {
    if (block.type === "title") continue;

    if (html.length > 0 && block.type !== "divider") {
      html.push('<p data-dechive-blank="1">ㅤ</p>');
    }

    if (block.type === "paragraph") {
      html.push(
        "<p>" + escapeNaverHtml(block.content).replace(/\n/g, "<br>") + "</p>",
      );
      text.push(block.content);
      continue;
    }

    if (block.type === "heading") {
      html.push("<H2>" + escapeNaverHtml(block.content) + "</H2>");
      text.push(block.content);
      continue;
    }

    if (block.type === "quote") {
      html.push(
        "<blockquote>" + escapeNaverHtml(block.content) + "</blockquote>",
      );
      text.push(block.content);
      continue;
    }

    if (block.type === "divider") {
      html.push('<p data-dechive-divider="1"></p>');
      continue;
    }

    if (block.type === "image" && block.dataUrl) {
      const imageIndex = images.length;
      images.push({
        dataUrl: block.dataUrl,
        alt: block.fileName || "DECHIVE image",
        slot: "IMAGE_" + String(imageIndex + 1),
        sequence: imageIndex,
      });
      html.push('<p data-dd-photo-slot="' + String(imageIndex) + '"></p>');

      const caption = block.content.trim();
      if (caption && caption !== "이미지 설명을 입력하세요.") {
        captionCount += 1;
        html.push(
          '<figcaption data-dechive-caption="' +
            String(captionCount) +
            '">' +
            escapeNaverHtml(caption) +
            "</figcaption>",
        );
      }
    }
  }

  return {
    title: title.trim(),
    html: html.join(""),
    text: text.join(" ").replace(/\s+/g, " ").trim(),
    images,
    bodyTags,
    photoWriter: true,
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("이미지 파일을 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

function bridgeRequest(type: string, payload?: unknown, timeoutMs = 5000) {
  return new Promise<BridgeReply>((resolve, reject) => {
    const requestId =
      "dechive-" +
      String(Date.now()) +
      "-" +
      Math.random().toString(36).slice(2, 8);
    let timer = 0;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data as {
        source?: string;
        requestId?: string;
        ok?: boolean;
        result?: BridgeReply["result"];
        error?: string;
      };

      if (
        !data ||
        data.source !== BRIDGE_SOURCE ||
        data.requestId !== requestId
      ) {
        return;
      }

      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve({
        ok: data.ok,
        result: data.result,
        error: data.error,
      });
    };

    window.addEventListener("message", onMessage);
    timer = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("DECHIVE Naver Bridge 응답이 없습니다."));
    }, timeoutMs);

    window.postMessage(
      {
        source: WEB_SOURCE,
        type,
        requestId,
        payload,
      },
      "*",
    );
  });
}

function makeId(index: number) {
  return `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
}

function structureDraft(source: string): DraftBlock[] {
  const lines = source
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    let type: BlockType = "paragraph";
    let content = line;

    if (/^(?:-{3,}|_{3,}|\*{3,}|\[구분선\])$/.test(line)) {
      type = "divider";
      content = "";
    } else if (line.startsWith(">")) {
      type = "quote";
      content = line.replace(/^>\s*/, "");
    } else if (line.length <= 30 && !/[.!?。]$/.test(line)) {
      type = "heading";
    }

    return { id: makeId(index), type, content };
  });
}

export function NaverPublisherClient() {
  const [title, setTitle] = useState("");
  const [draft, setDraft] = useState("");
  const [blocks, setBlocks] = useState<DraftBlock[]>([]);
  const [images, setImages] = useState<DraftBlock[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [bridgeState, setBridgeState] = useState<BridgeState>("checking");
  const [isSending, setIsSending] = useState(false);
  const [tagsText, setTagsText] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const checkBridge = async () => {
    try {
      const response = await bridgeRequest("DECHIVE_BRIDGE_PING");
      if (!response.ok) {
        setBridgeState("missing");
        return;
      }

      setBridgeState(response.result?.naverReady ? "ready" : "naver-missing");
    } catch {
      setBridgeState("missing");
    }
  };

  const retryBridge = () => {
    setBridgeState("checking");
    void checkBridge();
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void checkBridge(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const createPreview = () => {
    const nextBlocks = structureDraft(draft);

    if (!title.trim()) {
      setMessage("제목을 입력해 주세요.");
      return;
    }

    if (nextBlocks.length === 0) {
      setMessage("본문을 입력해 주세요.");
      return;
    }

    setMessage(null);
    startTransition(() => {
      setBlocks([...nextBlocks, ...images]);
    });
  };

  const updateBlock = (id: string, patch: Partial<DraftBlock>) => {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id ? { ...block, ...patch } : block,
      ),
    );
  };

  const moveBlock = (id: string, offset: -1 | 1) => {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const targetIndex = index + offset;

      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const dropBlock = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    setBlocks((current) => {
      const sourceIndex = current.findIndex((block) => block.id === draggedId);
      const targetIndex = current.findIndex((block) => block.id === targetId);

      if (sourceIndex < 0 || targetIndex < 0) return current;

      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedId(null);
  };

  const addDivider = () => {
    setBlocks((current) => [
      ...current,
      { id: makeId(current.length), type: "divider", content: "" },
    ]);
  };

  const addImage = async (file: File | undefined) => {
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImages((current) => [
        ...current,
        {
          id: makeId(current.length),
          type: "image",
          content: "이미지 설명을 입력하세요.",
          fileName: file.name,
          dataUrl,
        },
      ]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "이미지를 읽지 못했습니다.",
      );
    }
  };

  const sendToNaver = async () => {
    if (blocks.length === 0) {
      setMessage("먼저 미리보기를 만들어 주세요.");
      return;
    }

    if (bridgeState === "missing") {
      setMessage(
        "네이버 연결 프로그램을 설치한 뒤 페이지를 새로고침해 주세요.",
      );
      return;
    }

    const bodyTags = Array.from(
      new Set(
        tagsText
          .split(/[,\n]+/)
          .map((tag) => tag.trim().replace(/^#+/, "").replace(/\s+/g, ""))
          .filter(Boolean),
      ),
    );

    setIsSending(true);
    setMessage(
      "네이버 창을 열고 있습니다. 로그인 화면이 나오면 로그인해 주세요…",
    );

    try {
      const response = await bridgeRequest(
        "DECHIVE_BRIDGE_INSERT",
        { payload: buildNaverPayload(title, blocks, bodyTags) },
        150000,
      );

      if (!response.ok) {
        throw new Error(response.error || "네이버 전송에 실패했습니다.");
      }

      const result = response.result;
      const imageText =
        result?.imageRequestedCount && result.imageRequestedCount > 0
          ? " · 이미지 " +
            String(result.imageInsertedCount || 0) +
            "/" +
            String(result.imageRequestedCount)
          : "";
      const saveText = result?.draftSave?.clicked
        ? " · 임시저장 완료"
        : " · 입력 완료";

      setMessage("네이버에 전송했습니다" + imageText + saveText + ".");
      setBridgeState("ready");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "네이버 전송에 실패했습니다.",
      );
      void checkBridge();
    } finally {
      setIsSending(false);
    }
  };

  const bridgeText =
    bridgeState === "ready"
      ? "● 네이버 연결됨"
      : bridgeState === "naver-missing"
        ? "● 네이버 연결됨"
        : bridgeState === "checking"
          ? "네이버 연결 확인 중"
          : "네이버 연결 필요";

  return (
    <div className="border border-[color:rgb(9_41_68_/_14%)] bg-[color:rgb(255_255_255_/_22%)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:rgb(9_41_68_/_12%)] px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-editorial text-xl font-semibold">
              NAVER PUBLISHER
            </h2>
            <span className="border border-[var(--terracotta)] px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-[var(--terracotta)]">
              v1.0
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-[color:rgb(9_41_68_/_18%)] bg-white px-3 py-2 text-[12px] font-semibold text-[var(--navy)]">
            {bridgeText}
          </span>
          <button
            type="button"
            onClick={retryBridge}
            className="h-9 border border-[color:rgb(9_41_68_/_18%)] bg-white px-3 text-[11px] font-medium transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
          >
            다시 확인
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)]">
        <section className="border-b border-[color:rgb(9_41_68_/_12%)] p-5 sm:p-6 lg:border-r lg:border-b-0">
          <div>
            <h3 className="font-editorial text-3xl font-semibold">
              원고와 이미지를 넣어주세요.
            </h3>
            <p className="mt-3 text-[15px] leading-7">
              문장은 그대로 유지하고, 소제목·인용구·구분선을 판단해 네이버
              블로그에서 읽기 좋은 구조로 정리합니다.
            </p>
          </div>

          <label
            htmlFor="publisher-title"
            className="mt-6 block text-[14px] font-semibold"
          >
            제목
          </label>
          <input
            id="publisher-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="블로그 제목을 입력하세요."
            className="mt-2 h-12 w-full border border-[color:rgb(9_41_68_/_18%)] bg-white px-4 text-[16px] font-medium outline-none placeholder:text-[color:rgb(9_41_68_/_45%)] focus:border-[var(--terracotta)]"
          />

          <label
            htmlFor="publisher-draft"
            className="mt-5 block text-[14px] font-semibold"
          >
            원고
          </label>
          <textarea
            id="publisher-draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="유튜브 대본, SNS용 글, ChatGPT에서 완성한 원고, 직접 쓴 글을 그대로 붙여넣으세요."
            className="mt-2 min-h-[380px] w-full resize-y border border-[color:rgb(9_41_68_/_18%)] bg-white p-4 text-[15px] leading-7 outline-none placeholder:text-[color:rgb(9_41_68_/_45%)] focus:border-[var(--terracotta)]"
          />

          <div className="mt-5">
            <p className="text-[14px] font-semibold">이미지</p>
            <label
              className="mt-2 inline-flex h-12 w-full cursor-pointer items-center justify-center border border-dashed border-[color:rgb(9_41_68_/_24%)] bg-white px-4 text-[14px] font-semibold transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
            >
              + 이미지 추가
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  void addImage(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
            {images.length > 0 ? (
              <p className="mt-2 text-[13px] font-medium">
                이미지 {images.length}장 준비됨
              </p>
            ) : null}
          </div>

          {message ? (
            <p
              className="mt-3 text-[13px] font-medium text-[var(--terracotta)]"
              role="status"
            >
              {message}
            </p>
          ) : null}

          <div className="mt-5">
            <button
              type="button"
              onClick={createPreview}
              disabled={isPending}
              className="inline-flex h-12 w-full items-center justify-center bg-[var(--terracotta)] px-6 text-[15px] font-semibold text-[#fffaf2] transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {isPending
                ? "네이버용으로 정리하는 중…"
                : "네이버용으로 변환하기 →"}
            </button>
          </div>

          <div className="mt-5 border-t border-[color:rgb(9_41_68_/_10%)] pt-4">
            <label
              htmlFor="publisher-tags"
              className="text-[14px] font-semibold text-[var(--navy)]"
            >
              태그
            </label>
            <input
              id="publisher-tags"
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              placeholder="AI, 머신러닝, 딥러닝"
              className="mt-2 h-12 w-full border border-[color:rgb(9_41_68_/_18%)] bg-white px-3 text-[14px] outline-none placeholder:text-[color:rgb(9_41_68_/_45%)] focus:border-[var(--terracotta)]"
            />
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
              <span>쉼표로 구분</span>
              <span className="font-medium">카테고리 · 네이버 기본값</span>
            </div>
          </div>
        </section>

        <section className="bg-[color:rgb(185_79_44_/_2%)] p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-editorial text-3xl font-semibold">
                네이버 미리보기
              </h3>
              <p className="mt-2 text-[15px] leading-6">
                내 원고가 네이버 블로그에서 어떻게 보일지 먼저 확인하세요.
              </p>
            </div>

            {blocks.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowAdvanced((current) => !current)}
                className="inline-flex h-9 items-center border border-[color:rgb(9_41_68_/_18%)] bg-white px-3 text-[12px] font-semibold transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
              >
                {showAdvanced ? "상세 편집 닫기" : "필요하면 상세 편집"}
              </button>
            ) : null}
          </div>

          {showAdvanced ? (
            <div className="mt-5 min-h-[455px] border border-[color:rgb(9_41_68_/_12%)] bg-[#fffdf8] p-4 sm:p-6">
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={addDivider}
                  className="inline-flex h-9 items-center border border-[color:rgb(9_41_68_/_18%)] bg-white px-3 text-[12px] font-semibold transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
                >
                  + 구분선 직접 추가
                </button>
              </div>
              {blocks.length === 0 ? (
                <div className="flex min-h-[405px] flex-col items-center justify-center text-center">
                  <span className="font-editorial text-4xl text-[color:rgb(185_79_44_/_28%)]">
                    02
                  </span>
                  <p className="font-editorial mt-4 text-base font-semibold">
                    정리된 글이 이곳에 나타납니다.
                  </p>
                  <p className="mt-2 max-w-xs text-[10px] leading-5 opacity-45">
                    내부 마커나 코드 대신 실제 독자가 보게 될 문서 구조만
                    표시합니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blocks.map((block, index) => (
                    <article
                      key={block.id}
                      draggable
                      onDragStart={() => setDraggedId(block.id)}
                      onDragEnd={() => setDraggedId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => dropBlock(block.id)}
                      className={`group border p-3 transition-colors ${draggedId === block.id ? "border-[var(--terracotta)] opacity-55" : "border-[color:rgb(9_41_68_/_10%)] hover:border-[color:rgb(185_79_44_/_32%)]"}`}
                    >
                      <div className="flex flex-wrap items-center gap-1.5 border-b border-[color:rgb(9_41_68_/_8%)] pb-2">
                        <span className="mr-1 text-[9px] opacity-35">⋮⋮</span>
                        {block.type === "title" ||
                        block.type === "image" ||
                        block.type === "divider" ? (
                          <span className="text-[9px] font-semibold text-[var(--terracotta)]">
                            {blockLabels[block.type]}
                          </span>
                        ) : (
                          editableBlockTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => updateBlock(block.id, { type })}
                              className={`px-2 py-1 text-[9px] transition-colors ${block.type === type ? "bg-[var(--navy)] text-[#fffaf2]" : "opacity-45 hover:opacity-100"}`}
                            >
                              {blockLabels[type]}
                            </button>
                          ))
                        )}
                        <div className="ml-auto flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveBlock(block.id, -1)}
                            disabled={index === 0}
                            className="px-1.5 text-[10px] opacity-45 hover:opacity-100 disabled:opacity-15"
                            aria-label={`${blockLabels[block.type]} 블록을 위로 이동`}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(block.id, 1)}
                            disabled={index === blocks.length - 1}
                            className="px-1.5 text-[10px] opacity-45 hover:opacity-100 disabled:opacity-15"
                            aria-label={`${blockLabels[block.type]} 블록을 아래로 이동`}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setBlocks((current) =>
                                current.filter((item) => item.id !== block.id),
                              )
                            }
                            className="px-1.5 text-[10px] text-[var(--terracotta)] opacity-45 hover:opacity-100"
                            aria-label={`${blockLabels[block.type]} 블록 삭제`}
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {block.type === "divider" ? (
                        <div className="my-6 h-px bg-[color:rgb(9_41_68_/_28%)]" />
                      ) : block.type === "image" ? (
                        <div className="mt-3 border border-dashed border-[color:rgb(9_41_68_/_18%)] bg-[color:rgb(9_41_68_/_3%)] p-5 text-center">
                          <p className="text-[10px] font-semibold">
                            {block.fileName}
                          </p>
                          <input
                            value={block.content}
                            onChange={(event) =>
                              updateBlock(block.id, {
                                content: event.target.value,
                              })
                            }
                            className="mt-2 w-full bg-transparent text-center text-[10px] opacity-55 outline-none"
                            aria-label="이미지 설명"
                          />
                        </div>
                      ) : (
                        <textarea
                          value={block.content}
                          onChange={(event) =>
                            updateBlock(block.id, {
                              content: event.target.value,
                            })
                          }
                          rows={block.type === "paragraph" ? 3 : 2}
                          className={`mt-3 w-full resize-y bg-transparent outline-none ${block.type === "title" ? "font-editorial text-xl leading-tight font-semibold" : ""} ${block.type === "heading" ? "font-editorial text-base font-semibold" : ""} ${block.type === "quote" ? "border-l-2 border-[var(--terracotta)] pl-3 text-xs leading-6 italic" : ""} ${block.type === "paragraph" ? "text-xs leading-6" : ""}`}
                          aria-label={`${blockLabels[block.type]} 블록 내용`}
                        />
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {blocks.length > 0 ? (
            <section
              id="naver-blog-preview"
              className="mt-5 scroll-mt-24 border border-[color:rgb(9_41_68_/_12%)] bg-white"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[color:rgb(9_41_68_/_12%)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-[19px] font-black tracking-[-0.04em] text-[#03c75a]">
                    NAVER
                  </span>
                  <span className="text-[15px] font-semibold text-[#222]">
                    블로그
                  </span>
                </div>
                <span className="border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] font-semibold text-[#555]">
                  PC 미리보기
                </span>
              </div>
              <div className="mx-auto max-w-[820px] px-6 py-12 sm:px-10">
                <h2 className="mb-4 text-center text-[34px] leading-[1.35] font-semibold tracking-[-0.03em] text-[#111]">
                  {title}
                </h2>
                <div className="mb-12 flex items-center justify-center gap-2 text-[13px] text-[#777]">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#222] text-[9px] font-bold text-white">
                    D
                  </span>
                  <span>DECHIVE</span>
                  <span>·</span>
                  <span>미리보기</span>
                </div>
                {blocks.map((block) => {
                  if (block.type === "title") return null;

                  if (block.type === "divider") {
                    return (
                      <div
                        key={block.id}
                        className="my-10 h-px bg-[#d9d9d9]"
                        aria-label="구분선"
                      />
                    );
                  }

                  if (block.type === "heading") {
                    return (
                      <h3
                        key={block.id}
                        className="mt-10 mb-5 text-[24px] leading-[1.5] font-bold text-[#111]"
                      >
                        {block.content}
                      </h3>
                    );
                  }

                  if (block.type === "quote") {
                    return (
                      <blockquote
                        key={block.id}
                        className="my-8 border-l-2 border-[#222] px-5 py-3 text-center text-[18px] leading-8 font-bold text-[#222]"
                      >
                        {block.content}
                      </blockquote>
                    );
                  }

                  if (block.type === "image") {
                    return (
                      <figure key={block.id} className="my-8">
                        {block.dataUrl ? (
                          // A user-selected data URL cannot benefit from Next.js image optimization.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={block.dataUrl}
                            alt={block.fileName || "미리보기 이미지"}
                            className="mx-auto h-auto max-h-[620px] max-w-full object-contain"
                          />
                        ) : null}
                        <figcaption className="mt-2 text-center text-[12px] leading-5 text-[#555]">
                          {block.content === "이미지 설명을 입력하세요."
                            ? ""
                            : block.content}
                        </figcaption>
                      </figure>
                    );
                  }

                  return (
                    <p
                      key={block.id}
                      className="my-5 text-[17px] leading-[2] whitespace-pre-wrap text-[#333]"
                    >
                      {block.content}
                    </p>
                  );
                })}
                {tagsText.trim() ? (
                  <p className="mt-10 text-[14px] leading-7 text-[#555]">
                    {tagsText
                      .split(/[,\n]+/)
                      .map((tag) => tag.trim().replace(/^#+/, ""))
                      .filter(Boolean)
                      .map((tag) => "#" + tag.replace(/\s+/g, ""))
                      .join(" ")}
                  </p>
                ) : null}
              </div>
            </section>
          ) : (
            <section
              id="naver-blog-preview"
              className="mt-5 scroll-mt-24 border border-[color:rgb(9_41_68_/_12%)] bg-white"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[color:rgb(9_41_68_/_12%)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-[19px] font-black tracking-[-0.04em] text-[#03c75a]">
                    NAVER
                  </span>
                  <span className="text-[15px] font-semibold text-[#222]">
                    블로그
                  </span>
                </div>
                <span className="border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] font-semibold text-[#555]">
                  PC 미리보기
                </span>
              </div>
              <div className="flex min-h-[560px] flex-col items-center justify-center px-8 text-center">
                <p className="font-editorial text-3xl font-semibold text-[#222]">
                  내 원고가 네이버에서는 어떻게 보일까요?
                </p>
                <p className="mt-4 max-w-lg text-[15px] leading-7 text-[#666]">
                  원고와 이미지를 넣고 변환하면 소제목, 인용구, 구분선을 반영한
                  네이버 블로그 미리보기가 이곳에 나타납니다.
                </p>
              </div>
            </section>
          )}

          <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="text-[14px] leading-6">
              보내기를 누르면 네이버 글쓰기 화면이 열리고 임시저장까지
              진행됩니다.
            </p>
            <button
              type="button"
              onClick={() => void sendToNaver()}
              disabled={isSending || blocks.length === 0}
              className="inline-flex h-12 items-center justify-center border border-[color:rgb(9_41_68_/_18%)] bg-[var(--navy)] px-6 text-[14px] font-semibold text-[#fffaf2] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isSending
                ? "네이버로 보내는 중…"
                : "네이버 임시저장으로 보내기 →"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
