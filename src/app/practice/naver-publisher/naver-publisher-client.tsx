"use client";

import { useState, useTransition } from "react";

type BlockType = "title" | "heading" | "paragraph" | "quote" | "image";

type DraftBlock = {
  id: string;
  type: BlockType;
  content: string;
  fileName?: string;
};

const blockLabels: Record<BlockType, string> = {
  title: "제목",
  heading: "큰 제목",
  paragraph: "본문",
  quote: "인용구",
  image: "이미지",
};

const editableBlockTypes: readonly BlockType[] = [
  "paragraph",
  "heading",
  "quote",
];

const sampleDraft = `머신러닝을 이해하는 가장 쉬운 방법

메일함을 열어보면 어떤 메일은 받은편지함에, 어떤 메일은 스팸함에 들어갑니다.

사람이 규칙을 전부 적지 않아도 되는 이유

머신러닝은 수많은 예시에서 반복되는 특징을 찾아 새로운 데이터를 구분합니다.

> 중요한 것은 AI의 결과를 그대로 믿는 것이 아니라, 사람이 맥락에 맞는지 확인하는 일입니다.

학습과 추론은 서로 다른 과정입니다. 학습에서는 패턴을 찾고, 추론에서는 그 패턴을 새로운 데이터에 적용합니다.`;

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

    if (index === 0) {
      type = "title";
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
  const [draft, setDraft] = useState("");
  const [blocks, setBlocks] = useState<DraftBlock[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const createPreview = () => {
    const nextBlocks = structureDraft(draft);

    if (nextBlocks.length === 0) {
      setMessage("먼저 원고를 붙여넣어 주세요.");
      return;
    }

    setMessage(null);
    startTransition(() => {
      setBlocks(nextBlocks);
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

  const addImage = (file: File | undefined) => {
    if (!file) return;

    setBlocks((current) => [
      ...current,
      {
        id: makeId(current.length),
        type: "image",
        content: "이미지 설명을 입력하세요.",
        fileName: file.name,
      },
    ]);
  };

  return (
    <div className="border border-[color:rgb(9_41_68_/_14%)] bg-[color:rgb(255_255_255_/_22%)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:rgb(9_41_68_/_12%)] px-5 py-4 sm:px-6">
        <div>
          <p className="text-[9px] tracking-[0.15em] text-[var(--terracotta)]">
            PUBLISHER WORKSPACE
          </p>
          <h2 className="font-editorial mt-1 text-lg font-semibold">
            원고에서 미리보기까지
          </h2>
        </div>
        <span className="border border-[color:rgb(185_79_44_/_22%)] bg-[color:rgb(185_79_44_/_5%)] px-3 py-1.5 text-[10px] text-[var(--terracotta)]">
          웹 미리보기 사용 가능 · Bridge 준비 중
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)]">
        <section className="border-b border-[color:rgb(9_41_68_/_12%)] p-5 sm:p-6 lg:border-r lg:border-b-0">
          <div className="flex items-start gap-3">
            <span className="font-editorial text-sm text-[var(--terracotta)]">
              01
            </span>
            <div>
              <h3 className="font-editorial text-lg font-semibold">원고</h3>
              <p className="mt-1 text-[11px] leading-5 opacity-55">
                ChatGPT 답변, 메모, 기존 글을 그대로 붙여넣으세요.
              </p>
            </div>
          </div>

          <label htmlFor="publisher-draft" className="sr-only">
            네이버용으로 정리할 원고
          </label>
          <textarea
            id="publisher-draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="이미 작성한 글을 여기에 그대로 붙여넣으세요.\n\n첫 줄은 제목으로, 짧은 문장은 소제목으로 정리됩니다."
            className="mt-5 min-h-[330px] w-full resize-y border border-[color:rgb(9_41_68_/_14%)] bg-[#fffaf2] p-4 text-xs leading-6 outline-none placeholder:opacity-35 focus:border-[var(--terracotta)]"
          />

          {message ? (
            <p
              className="mt-2 text-[10px] text-[var(--terracotta)]"
              role="status"
            >
              {message}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={createPreview}
              disabled={isPending}
              className="inline-flex h-10 items-center bg-[var(--terracotta)] px-5 text-xs font-semibold text-[#fffaf2] transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {isPending ? "구조를 정리하는 중…" : "미리보기 만들기 →"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(sampleDraft);
                setMessage(null);
              }}
              className="inline-flex h-10 items-center border border-[color:rgb(9_41_68_/_20%)] px-4 text-[11px] transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
            >
              예시 원고 넣기
            </button>
          </div>

          <p className="mt-5 border-t border-[color:rgb(9_41_68_/_10%)] pt-4 text-[10px] leading-5 opacity-48">
            현재 버전은 브라우저 안에서 블록 구조를 미리 보여주는 단계입니다.
            입력한 원고는 서버로 전송되지 않습니다.
          </p>
        </section>

        <section className="bg-[color:rgb(185_79_44_/_2%)] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="font-editorial text-sm text-[var(--terracotta)]">
                02
              </span>
              <div>
                <h3 className="font-editorial text-lg font-semibold">
                  블록 미리보기
                </h3>
                <p className="mt-1 text-[11px] leading-5 opacity-55">
                  형식과 순서를 바꾼 뒤 사람이 직접 확인합니다.
                </p>
              </div>
            </div>

            <label className="inline-flex h-8 cursor-pointer items-center border border-[color:rgb(9_41_68_/_16%)] px-3 text-[10px] transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]">
              + 이미지
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  addImage(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>

          <div className="mt-5 min-h-[455px] border border-[color:rgb(9_41_68_/_12%)] bg-[#fffdf8] p-4 sm:p-6">
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
                      {block.type === "title" || block.type === "image" ? (
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

                    {block.type === "image" ? (
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
                          updateBlock(block.id, { content: event.target.value })
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

          <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="text-[10px] leading-4 opacity-48">
              최종 발행은 네이버에서 사람이 확인한 뒤 진행합니다.
            </p>
            <button
              type="button"
              onClick={() =>
                setMessage(
                  "Naver Bridge 연결은 준비 중입니다. 현재는 블록 미리보기까지만 사용할 수 있습니다.",
                )
              }
              className="inline-flex h-11 items-center justify-center border border-[color:rgb(9_41_68_/_18%)] bg-[var(--navy)] px-5 text-xs font-semibold text-[#fffaf2] transition-opacity hover:opacity-85"
            >
              네이버 임시저장으로 보내기 →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
