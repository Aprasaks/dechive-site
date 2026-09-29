"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { snsSalesSupabase } from "@/lib/sns-sales-supabase";

type MediaKind = "video" | "image";

type SelectedMedia = {
  id: string;
  name: string;
  url: string;
  type: string;
};

type InstagramConnection = {
  id: string;
  instagram_user_id: string;
  instagram_username: string;
  account_type: string | null;
  granted_permissions: string[];
  token_expires_at: string | null;
  status: string;
};

export function SnsSalesClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [authSending, setAuthSending] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<MediaKind>("video");
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [workspaceView, setWorkspaceView] = useState<"content" | "preview">("content");
  const inputRef = useRef<HTMLInputElement>(null);

  const connected = Boolean(connection);

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

  async function loadConnection() {
    if (!session) {
      setConnection(null);
      return;
    }

    setConnectionLoading(true);
    try {
      const { data, error } = await snsSalesSupabase.functions.invoke(
        "sns-sales-instagram-status",
        { method: "POST", body: {} },
      );
      if (error) throw error;
      setConnection(data?.connected ? data.connection : null);
    } catch {
      setConnection(null);
      setNotice("Instagram 연결 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setConnectionLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    snsSalesSupabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
    });

    const { data: authListener } = snsSalesSupabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setAuthReady(true);
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    void loadConnection();
    // loadConnection intentionally follows session changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id, authReady]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("instagram_connected") === "1") {
      setNotice("Instagram 계정 연결이 완료되었습니다.");
      params.delete("instagram_connected");
      window.history.replaceState({}, "", `${window.location.pathname}${params.size ? `?${params.toString()}` : ""}`);
    }
    if (params.get("instagram_error")) {
      setNotice("Instagram 연결을 완료하지 못했습니다. 다시 시도해주세요.");
      params.delete("instagram_error");
      window.history.replaceState({}, "", `${window.location.pathname}${params.size ? `?${params.toString()}` : ""}`);
    }
  }, []);

  async function handleInstagramConnect() {
    if (!session) {
      setLoginOpen(true);
      return;
    }

    setConnecting(true);
    setNotice(null);
    try {
      const { data, error } = await snsSalesSupabase.functions.invoke(
        "sns-sales-instagram-oauth-start",
        { body: {} },
      );
      if (error) throw error;
      if (!data?.authorizationUrl) throw new Error("missing authorization url");
      window.location.assign(data.authorizationUrl);
    } catch {
      setNotice("Instagram 연결을 시작하지 못했습니다. 로그인 상태를 다시 확인해주세요.");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!session || !connection) return;

    setDisconnecting(true);
    setNotice(null);
    try {
      const { data, error } = await snsSalesSupabase.functions.invoke(
        "sns-sales-instagram-disconnect",
        { body: { connectionId: connection.id } },
      );
      if (error || !data?.ok) throw error ?? new Error("disconnect failed");
      setConnection(null);
      setAccountExpanded(false);
      setSelectedMedia((items) => {
        items.forEach((item) => URL.revokeObjectURL(item.url));
        return [];
      });
      setNotice("Instagram 연결을 해제했습니다.");
    } catch {
      setNotice("Instagram 연결 해제에 실패했습니다.");
    } finally {
      setDisconnecting(false);
    }
  }

  async function sendLoginLink() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setAuthMessage("이메일 주소를 입력해주세요.");
      return;
    }

    setAuthSending(true);
    setAuthMessage(null);
    try {
      const { error } = await snsSalesSupabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/practice/sns-sales`,
        },
      });
      if (error) throw error;
      setAuthMessage("로그인 링크를 이메일로 보냈습니다. 받은 메일에서 링크를 열어주세요.");
    } catch {
      setAuthMessage("로그인 링크를 보내지 못했습니다. 이메일 주소를 확인해주세요.");
    } finally {
      setAuthSending(false);
    }
  }

  async function signOut() {
    await snsSalesSupabase.auth.signOut();
    setConnection(null);
    setLoginOpen(false);
    setNotice("로그아웃했습니다.");
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
          <section className="border border-[color:rgb(9_41_68_/_13%)] bg-[color:rgb(255_255_255_/_20%)] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="flex items-baseline gap-1.5 text-[15px] font-semibold">
                  <span className="font-handwriting text-[21px] leading-none font-normal tracking-[-0.03em]">
                    Instagram
                  </span>
                  <span>계정</span>
                </h2>
                {connected ? (
                  <p className="mt-1 truncate text-[10px] opacity-58">
                    @{connection?.instagram_username}
                    <span className="mx-1.5 opacity-35">·</span>
                    {connection?.account_type || "Professional"}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={
                    connected
                      ? "inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#2f7b49]"
                      : "inline-flex items-center gap-1.5 text-[10px] font-semibold opacity-48"
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

                {connected ? (
                  <button
                    type="button"
                    onClick={() => setAccountExpanded((value) => !value)}
                    className="border border-[color:rgb(9_41_68_/_14%)] px-2 py-1 text-[9px] font-semibold opacity-60 transition-opacity hover:opacity-100"
                  >
                    {accountExpanded ? "접기" : "관리"}
                  </button>
                ) : null}
              </div>
            </div>

            {!connected ? (
              <>
                <div className="mt-3 space-y-1">
                  <p className="text-[11px] font-semibold leading-5 text-[#b44343]">
                    Business 또는 Creator 계정만 연결 가능합니다.
                  </p>
                  <p className="text-[10px] leading-5 opacity-52">
                    계정 연결이 완료되면 콘텐츠 등록과 판매 자동화를 시작할 수 있습니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleInstagramConnect}
                  disabled={connecting || connectionLoading}
                  className="mt-3 h-9 w-full bg-[var(--navy)] px-3 text-[11px] font-semibold text-[#fffaf2] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {connecting ? "연결 준비 중..." : "Instagram 계정 연결하기"}
                </button>
              </>
            ) : accountExpanded ? (
              <div className="mt-3 border-t border-[color:rgb(9_41_68_/_9%)] pt-3">
                <div className="flex items-center justify-between gap-3 text-[9px]">
                  <span className="max-w-[220px] truncate opacity-45">
                    {session?.user.email ? `DECHIVE · ${session.user.email}` : "DECHIVE 로그인"}
                  </span>
                  {session ? (
                    <button
                      type="button"
                      onClick={signOut}
                      className="font-semibold opacity-48 transition-opacity hover:opacity-100"
                    >
                      로그아웃
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="mt-3 h-8 w-full border border-[color:rgb(9_41_68_/_18%)] px-3 text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {disconnecting ? "연결 해제 중..." : "Instagram 연결 해제"}
                </button>
              </div>
            ) : null}
          </section>

          <section className="border border-[color:rgb(9_41_68_/_12%)] px-3.5 py-3">
            <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
              <div>
                <span className="block opacity-42">계정</span>
                <b className="mt-1 block text-[10px]">{connected ? "확인" : "대기"}</b>
              </div>
              <div className="border-x border-[color:rgb(9_41_68_/_10%)]">
                <span className="block opacity-42">콘텐츠</span>
                <b className="mt-1 block text-[10px]">{selectedMedia.length ? "선택" : "대기"}</b>
              </div>
              <div>
                <span className="block opacity-42">게시</span>
                <b className="mt-1 block text-[10px]">게시 전</b>
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
            <div className="flex items-center justify-between border-b border-[color:rgb(9_41_68_/_12%)] px-4 py-2.5">
              <div className="flex border border-[color:rgb(9_41_68_/_14%)] p-0.5">
                <button
                  type="button"
                  onClick={() => setWorkspaceView("content")}
                  className={
                    workspaceView === "content"
                      ? "bg-[var(--navy)] px-3 py-1.5 text-[10px] font-semibold text-white"
                      : "px-3 py-1.5 text-[10px] font-semibold opacity-48"
                  }
                >
                  콘텐츠 등록
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceView("preview")}
                  className={
                    workspaceView === "preview"
                      ? "bg-[var(--navy)] px-3 py-1.5 text-[10px] font-semibold text-white"
                      : "px-3 py-1.5 text-[10px] font-semibold opacity-48"
                  }
                >
                  미리보기
                </button>
              </div>
              <span className="text-[9px] opacity-38">
                {workspaceView === "content" ? "판매 콘텐츠를 준비합니다." : "Instagram 게시 형태를 확인합니다."}
              </span>
            </div>

            {workspaceView === "content" ? (
              <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
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
                    className="mt-4 flex min-h-36 w-full flex-col items-center justify-center border border-dashed border-[color:rgb(9_41_68_/_22%)] px-6 py-6 text-center transition-colors hover:bg-[color:rgb(9_41_68_/_2%)]"
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
                        rows={4}
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

                  <button
                    type="button"
                    onClick={() => setWorkspaceView("preview")}
                    className="mt-4 h-9 w-full border border-[color:rgb(9_41_68_/_18%)] px-3 text-[10px] font-semibold transition-colors hover:bg-[color:rgb(9_41_68_/_3%)]"
                  >
                    미리보기 확인 →
                  </button>
                </div>
              </div>
            ) : (
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
                      onClick={() => setWorkspaceView("content")}
                      className="border border-[color:rgb(9_41_68_/_16%)] px-3 py-1.5 text-[10px] font-semibold"
                    >
                      ← 내용 수정
                    </button>
                  </div>

                  <div className="mx-auto mt-4 max-w-[360px] border border-[color:rgb(9_41_68_/_16%)] bg-[#faf7f1]">
                    <div className="flex h-10 items-center gap-2 border-b border-[color:rgb(9_41_68_/_10%)] px-3">
                      <span className="size-6 rounded-full border border-[color:rgb(9_41_68_/_14%)]" />
                      <b className="text-[10px]">@{connection?.instagram_username || "instagram"}</b>
                      <span className="ml-auto text-sm opacity-45">•••</span>
                    </div>
                    <div className="flex aspect-square max-h-[360px] items-center justify-center bg-[color:rgb(9_41_68_/_4%)]">
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
                        <b>@{connection?.instagram_username || "instagram"}</b>{" "}
                        <span className="opacity-50">입력한 설명이 여기에 표시됩니다.</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between border-t border-[color:rgb(9_41_68_/_12%)] p-4 lg:border-t-0 lg:border-l">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.1em] opacity-45">
                      FINAL CHECK
                    </p>
                    <div className="mt-3 space-y-2 text-[10px]">
                      <div className="flex justify-between gap-3 border-b border-[color:rgb(9_41_68_/_8%)] pb-2">
                        <span className="opacity-45">계정</span>
                        <b>@{connection?.instagram_username || "instagram"}</b>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-[color:rgb(9_41_68_/_8%)] pb-2">
                        <span className="opacity-45">미디어</span>
                        <b>{selectedMedia.length ? `${selectedMedia.length}개` : "미선택"}</b>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="opacity-45">게시 상태</span>
                        <b>게시 전</b>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[10px] leading-5 opacity-48">
                      실제 Instagram 계정과 미디어를 확인한 뒤 게시하세요.
                    </p>
                    <button
                      type="button"
                      className="mt-3 h-10 w-full bg-[var(--terracotta)] px-4 text-[11px] font-semibold text-[#fffaf2]"
                    >
                      Instagram에 게시
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {loginOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[color:rgb(9_41_68_/_28%)] px-5 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="DECHIVE 로그인"
        >
          <div className="w-full max-w-[380px] border border-[color:rgb(9_41_68_/_16%)] bg-[#f4efe6] p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--terracotta)]">
                  SECURE SIGN IN
                </p>
                <h2 className="mt-1 text-[16px] font-semibold">DECHIVE 로그인</h2>
              </div>
              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                className="text-lg leading-none opacity-40 hover:opacity-100"
                aria-label="로그인 창 닫기"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-[11px] leading-5 opacity-55">
              Instagram 연결과 판매 데이터는 로그인한 사용자 계정에 귀속됩니다.
            </p>

            <label className="mt-4 block text-[10px] font-semibold">
              이메일
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void sendLoginLink();
                }}
                autoComplete="email"
                placeholder="name@example.com"
                className="mt-1 h-10 w-full border border-[color:rgb(9_41_68_/_18%)] bg-transparent px-3 text-[12px] outline-none focus:border-[var(--navy)]"
              />
            </label>

            <button
              type="button"
              onClick={sendLoginLink}
              disabled={authSending}
              className="mt-3 h-10 w-full bg-[var(--navy)] px-4 text-[11px] font-semibold text-[#fffaf2] disabled:opacity-40"
            >
              {authSending ? "보내는 중..." : "로그인 링크 받기"}
            </button>

            {authMessage ? (
              <p className="mt-3 text-[10px] leading-5 text-[var(--terracotta)]">
                {authMessage}
              </p>
            ) : null}

            <p className="mt-4 border-t border-[color:rgb(9_41_68_/_10%)] pt-3 text-[9px] leading-4 opacity-40">
              로그인 후에만 Instagram OAuth를 시작할 수 있으며, Instagram access token은 브라우저에 저장하지 않습니다.
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
