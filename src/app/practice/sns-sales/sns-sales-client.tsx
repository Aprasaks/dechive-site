"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";

type MediaKind = "video" | "image";

type SelectedMedia = {
  id: string;
  name: string;
  url: string;
  type: string;
};

export function SnsSalesClient() {
  const [connected] = useState(false);
  const [mediaKind, setMediaKind] = useState<MediaKind>("video");
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = mediaKind === "video" ? "video/*" : "image/*";

  const previewLabel = useMemo(() => {
    if (!selectedMedia.length) return "미디어를 선택하면 이곳에서 미리 확인할 수 있습니다.";
    if (mediaKind === "video") return selectedMedia[0]?.name ?? "";
    return `${selectedMedia.length}장의 이미지가 선택되었습니다.`;
  }, [mediaKind, selectedMedia]);

  function chooseKind(kind: MediaKind) {
    setMediaKind(kind);
    setSelectedMedia((items) => {
      items.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const allowed = mediaKind === "video" ? files.slice(0, 1) : files.slice(0, 10);

    setSelectedMedia((items) => {
      items.forEach((item) => URL.revokeObjectURL(item.url));
      return allowed.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      }));
    });
  }

  function handleInstagramConnect() {
    setNotice(
      "새 공개판용 Instagram OAuth를 연결하는 단계가 남아 있습니다. 현재 화면에서는 가짜 연결 상태를 만들지 않습니다.",
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 py-5 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:rgb(9_41_68_/_14%)] pb-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--terracotta)]">
            PRACTICE TOOL
          </p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.035em] sm:text-[25px]">
            SNS 판매 자동화
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-5 opacity-58">
            Instagram 계정을 연결하고 판매 콘텐츠를 준비합니다. 실제 연결 상태와
            게시 상태만 화면에 표시합니다.
          </p>
        </div>
        <span className="border border-[color:rgb(9_41_68_/_14%)] px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] opacity-60">
          INSTAGRAM SALES AUTOMATION
        </span>
      </section>

      {notice ? (
        <div className="mt-4 flex items-start justify-between gap-4 border border-[color:rgb(185_79_44_/_28%)] bg-[color:rgb(185_79_44_/_5%)] px-4 py-3 text-[11px] leading-5">
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="shrink-0 opacity-50 transition-opacity hover:opacity-100"
            aria-label="안내 닫기"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="border border-[color:rgb(9_41_68_/_13%)] bg-[color:rgb(255_255_255_/_20%)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.1em] opacity-45">
                  INSTAGRAM ACCOUNT
                </p>
                <h2 className="mt-1 text-[15px] font-semibold">Instagram 계정</h2>
              </div>
              <span
                className={
                  connected
                    ? "inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2f7b49]"
                    : "inline-flex items-center gap-1.5 text-[11px] font-semibold opacity-48"
                }
              >
                <i
                  className={
                    connected
                      ? "size-2 rounded-full bg-[#39a660] shadow-[0_0_0_3px_rgb(57_166_96_/_12%)]"
                      : "size-2 rounded-full bg-[color:rgb(9_41_68_/_22%)]"
                  }
                />
                {connected ? "연결됨" : "연결 필요"}
              </span>
            </div>

            {connected ? (
              <div className="mt-4 border-t border-[color:rgb(9_41_68_/_10%)] pt-3">
                <strong className="block text-[13px]">@instagram</strong>
                <p className="mt-1 text-[10px] opacity-48">Professional account</p>
              </div>
            ) : (
              <p className="mt-4 text-[11px] leading-5 opacity-58">
                Business 또는 Creator 계정을 연결하면 콘텐츠 등록과 판매 자동화를
                시작할 수 있습니다.
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleInstagramConnect}
                className="h-9 flex-1 bg-[var(--navy)] px-3 text-[11px] font-semibold text-[#fffaf2] transition-opacity hover:opacity-85"
              >
                Instagram 계정 연결하기
              </button>
              <button
                type="button"
                disabled={!connected}
                className="h-9 border border-[color:rgb(9_41_68_/_18%)] px-3 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-30"
              >
                연결 해제
              </button>
            </div>
          </section>

          <section className="border border-[color:rgb(9_41_68_/_12%)] p-4">
            <p className="text-[10px] font-bold tracking-[0.1em] opacity-45">STATUS</p>
            <div className="mt-3 space-y-2 text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="opacity-48">계정 연결</span>
                <b>{connected ? "확인됨" : "대기"}</b>
              </div>
              <div className="flex justify-between gap-4">
                <span className="opacity-48">콘텐츠 등록</span>
                <b>{selectedMedia.length ? "선택됨" : "대기"}</b>
              </div>
              <div className="flex justify-between gap-4">
                <span className="opacity-48">Instagram 게시</span>
                <b>게시 전</b>
              </div>
            </div>
          </section>
        </aside>

        <section className="relative border border-[color:rgb(9_41_68_/_13%)] bg-[color:rgb(255_255_255_/_16%)]">
          {!connected ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[color:rgb(244_239_230_/_82%)] backdrop-blur-[1px]">
              <div className="max-w-sm px-6 text-center">
                <div className="mx-auto flex size-9 items-center justify-center border border-[color:rgb(9_41_68_/_18%)] text-sm">
                  ↗
                </div>
                <b className="mt-3 block text-[13px]">Instagram 연결이 필요합니다.</b>
                <p className="mt-1 text-[11px] leading-5 opacity-52">
                  계정 연결이 확인되면 콘텐츠 등록 영역이 활성화됩니다.
                </p>
              </div>
            </div>
          ) : null}

          <div className={connected ? "" : "pointer-events-none select-none opacity-28"}>
            <div className="grid border-b border-[color:rgb(9_41_68_/_12%)] lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.1em] opacity-45">
                      NEW SALE CONTENT
                    </p>
                    <h2 className="mt-1 text-[15px] font-semibold">새 판매 콘텐츠</h2>
                  </div>
                  <div className="flex border border-[color:rgb(9_41_68_/_15%)] p-0.5">
                    <button
                      type="button"
                      onClick={() => chooseKind("video")}
                      className={
                        mediaKind === "video"
                          ? "bg-[var(--navy)] px-3 py-1.5 text-[10px] font-semibold text-white"
                          : "px-3 py-1.5 text-[10px] font-semibold opacity-48"
                      }
                    >
                      동영상
                    </button>
                    <button
                      type="button"
                      onClick={() => chooseKind("image")}
                      className={
                        mediaKind === "image"
                          ? "bg-[var(--navy)] px-3 py-1.5 text-[10px] font-semibold text-white"
                          : "px-3 py-1.5 text-[10px] font-semibold opacity-48"
                      }
                    >
                      이미지
                    </button>
                  </div>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept={accept}
                  multiple={mediaKind === "image"}
                  onChange={handleFiles}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-4 flex min-h-40 w-full flex-col items-center justify-center border border-dashed border-[color:rgb(9_41_68_/_22%)] px-6 py-8 text-center transition-colors hover:bg-[color:rgb(9_41_68_/_2%)]"
                >
                  <span className="text-lg opacity-45">＋</span>
                  <b className="mt-2 text-[12px]">
                    {mediaKind === "video" ? "동영상 추가" : "이미지 추가"}
                  </b>
                  <span className="mt-1 text-[10px] opacity-45">
                    {mediaKind === "video"
                      ? "동영상 1개를 선택합니다."
                      : "이미지는 최대 10장까지 선택할 수 있습니다."}
                  </span>
                </button>

                {selectedMedia.length ? (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {selectedMedia.map((item, index) => (
                      <div
                        key={item.id}
                        className="relative aspect-square overflow-hidden border border-[color:rgb(9_41_68_/_12%)] bg-black/5"
                      >
                        {mediaKind === "video" ? (
                          <video src={item.url} className="size-full object-cover" muted />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt="" className="size-full object-cover" />
                        )}
                        <span className="absolute top-1 left-1 bg-[#fffaf2]/90 px-1.5 py-0.5 text-[9px] font-bold">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <p className="mt-2 text-[10px] opacity-42">{previewLabel}</p>
              </div>

              <div className="border-t border-[color:rgb(9_41_68_/_12%)] p-4 lg:border-t-0 lg:border-l">
                <p className="text-[10px] font-bold tracking-[0.1em] opacity-45">
                  SALES SETTINGS
                </p>
                <div className="mt-3 space-y-3">
                  <label className="block text-[10px] font-semibold">
                    상품명
                    <input
                      className="mt-1 h-9 w-full border border-[color:rgb(9_41_68_/_16%)] bg-transparent px-3 text-[11px] outline-none focus:border-[var(--navy)]"
                      placeholder="예: 빈티지 데님 재킷"
                    />
                  </label>
                  <label className="block text-[10px] font-semibold">
                    가격
                    <div className="relative mt-1">
                      <input
                        type="number"
                        className="h-9 w-full border border-[color:rgb(9_41_68_/_16%)] bg-transparent px-3 pr-8 text-[11px] outline-none focus:border-[var(--navy)]"
                        placeholder="59000"
                      />
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] opacity-38">
                        원
                      </span>
                    </div>
                  </label>
                  <label className="block text-[10px] font-semibold">
                    설명
                    <textarea
                      rows={5}
                      className="mt-1 w-full resize-none border border-[color:rgb(9_41_68_/_16%)] bg-transparent px-3 py-2 text-[11px] leading-5 outline-none focus:border-[var(--navy)]"
                      placeholder={'예: 사이즈 M / 상태 양호\n구매를 원하시면 댓글에 "구매"라고 입력해주세요.'}
                    />
                  </label>
                  <label className="block text-[10px] font-semibold">
                    댓글 트리거
                    <input
                      className="mt-1 h-9 w-full border border-[color:rgb(9_41_68_/_16%)] bg-transparent px-3 text-[11px] outline-none focus:border-[var(--navy)]"
                      placeholder="예: 구매"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.1em] opacity-45">
                      INSTAGRAM PREVIEW
                    </p>
                    <h2 className="mt-1 text-[15px] font-semibold">게시물 미리보기</h2>
                  </div>
                  <button
                    type="button"
                    className="border border-[color:rgb(9_41_68_/_16%)] px-3 py-1.5 text-[10px] font-semibold"
                  >
                    미리보기 새로고침
                  </button>
                </div>

                <div className="mt-4 mx-auto max-w-[390px] border border-[color:rgb(9_41_68_/_16%)] bg-[#faf7f1]">
                  <div className="flex h-11 items-center gap-2 border-b border-[color:rgb(9_41_68_/_10%)] px-3">
                    <span className="size-6 rounded-full border border-[color:rgb(9_41_68_/_14%)]" />
                    <b className="text-[10px]">@instagram</b>
                    <span className="ml-auto text-sm opacity-45">•••</span>
                  </div>
                  <div className="flex aspect-square items-center justify-center bg-[color:rgb(9_41_68_/_4%)]">
                    {selectedMedia[0] ? (
                      mediaKind === "video" ? (
                        <video
                          src={selectedMedia[0].url}
                          controls
                          className="size-full object-contain"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedMedia[0].url}
                          alt=""
                          className="size-full object-contain"
                        />
                      )
                    ) : (
                      <span className="text-[10px] opacity-38">미디어 미리보기</span>
                    )}
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="text-[15px] tracking-[0.24em]">♡ ◯ ✈</div>
                    <p className="mt-2 text-[10px] leading-4">
                      <b>@instagram</b>{" "}
                      <span className="opacity-50">입력한 설명이 여기에 표시됩니다.</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-end border-t border-[color:rgb(9_41_68_/_12%)] p-4 lg:border-t-0 lg:border-l">
                <p className="text-[10px] leading-5 opacity-48">
                  게시 전 실제 Instagram 계정, 미디어 순서, 설명과 트리거 설정을
                  확인하세요.
                </p>
                <button
                  type="button"
                  className="mt-3 h-10 bg-[var(--terracotta)] px-4 text-[11px] font-semibold text-[#fffaf2]"
                >
                  Instagram에 게시
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
