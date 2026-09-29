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
  file: File;
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

type SalesCampaign = {
  id: string;
  price: number | null;
  description: string;
  trigger_keyword: string;
  status: string;
  instagram_media_id: string | null;
  instagram_permalink: string | null;
  published_at: string | null;
  created_at: string;
};

type SalesComment = {
  id: string;
  campaign_id: string;
  instagram_comment_id: string;
  instagram_commenter_id: string | null;
  instagram_username: string;
  comment_text: string;
  matched_trigger: boolean;
  commented_at: string | null;
  received_at: string;
};

type QueueItem = {
  id: string;
  campaign_id: string;
  comment_id: string;
  instagram_commenter_id: string | null;
  instagram_username: string;
  queue_position: number;
  status: string;
  reserved_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  created_at: string;
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
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [triggerKeyword, setTriggerKeyword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [workspaceView, setWorkspaceView] = useState<"content" | "preview">("content");
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [appView, setAppView] = useState<"create" | "manage">("create");
  const [campaigns, setCampaigns] = useState<SalesCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [comments, setComments] = useState<SalesComment[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [syncingComments, setSyncingComments] = useState(false);
  const [controlError, setControlError] = useState<string | null>(null);
  const [clock, setClock] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const connected = Boolean(connection);
  const selectedCampaign =
    campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null;

  const accept = mediaKind === "video" ? "video/*" : "image/*";

  const previewLabel = useMemo(() => {
    if (!selectedMedia.length) return "미디어를 선택하면 이곳에서 미리 확인할 수 있습니다.";
    if (mediaKind === "video") return selectedMedia[0]?.name ?? "";
    return `${selectedMedia.length}장의 이미지가 선택되었습니다.`;
  }, [mediaKind, selectedMedia]);

  function chooseKind(kind: MediaKind) {
    if (kind === mediaKind) return;

    setMediaKind(kind);
    setSelectedMedia((items) => {
      items.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (mediaKind === "video") {
      const file = files[0];
      setSelectedMedia((items) => {
        items.forEach((item) => URL.revokeObjectURL(item.url));
        if (!file) return [];
        return [{
          id: crypto.randomUUID(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          file,
        }];
      });
      return;
    }

    setSelectedMedia((items) => {
      const remainingSlots = Math.max(0, 10 - items.length);
      const nextFiles = files.slice(0, remainingSlots);
      return [
        ...items,
        ...nextFiles.map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          file,
        })),
      ];
    });

    // Allow the same file to be selected again after it is removed.
    event.target.value = "";
  }

  function removeMedia(id: string) {
    setSelectedMedia((items) => {
      const target = items.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return items.filter((item) => item.id !== id);
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  function sleep(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function formatDateTime(value: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function formatRemaining(value: string | null) {
    if (!value) return "-";
    const seconds = Math.max(0, Math.floor((new Date(value).getTime() - clock) / 1000));
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  function queueStatusLabel(status: string) {
    if (status === "reserved") return "결제 진행";
    if (status === "waiting") return "대기";
    if (status === "paid") return "결제 완료";
    if (status === "expired") return "만료";
    if (status === "cancelled") return "취소";
    return status;
  }

  async function loadCampaigns(preferredId?: string) {
    if (!session) {
      setCampaigns([]);
      setSelectedCampaignId(null);
      return;
    }

    setCampaignsLoading(true);
    try {
      const { data, error } = await snsSalesSupabase
        .from("sns_sales_campaigns")
        .select(
          "id,price,description,trigger_keyword,status,instagram_media_id,instagram_permalink,published_at,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const next = (data ?? []) as SalesCampaign[];
      setCampaigns(next);
      setSelectedCampaignId((current) => {
        if (preferredId && next.some((item) => item.id === preferredId)) return preferredId;
        if (current && next.some((item) => item.id === current)) return current;
        return next[0]?.id ?? null;
      });
    } catch {
      setControlError("판매 캠페인 목록을 불러오지 못했습니다.");
    } finally {
      setCampaignsLoading(false);
    }
  }

  async function loadCampaignControl(campaignId: string) {
    if (!session) return;

    setCommentsLoading(true);
    setControlError(null);
    try {
      const [commentsResult, queueResult] = await Promise.all([
        snsSalesSupabase
          .from("sns_sales_comments")
          .select(
            "id,campaign_id,instagram_comment_id,instagram_commenter_id,instagram_username,comment_text,matched_trigger,commented_at,received_at",
          )
          .eq("campaign_id", campaignId)
          .order("commented_at", { ascending: true, nullsFirst: false })
          .order("received_at", { ascending: true }),
        snsSalesSupabase
          .from("sns_sales_purchase_queue")
          .select(
            "id,campaign_id,comment_id,instagram_commenter_id,instagram_username,queue_position,status,reserved_at,due_at,paid_at,created_at",
          )
          .eq("campaign_id", campaignId)
          .order("queue_position", { ascending: true }),
      ]);

      if (commentsResult.error) throw commentsResult.error;
      if (queueResult.error) throw queueResult.error;

      setComments((commentsResult.data ?? []) as SalesComment[]);
      setQueue((queueResult.data ?? []) as QueueItem[]);
    } catch {
      setControlError("댓글 또는 구매 대기열을 불러오지 못했습니다.");
    } finally {
      setCommentsLoading(false);
    }
  }

  async function syncCampaignComments() {
    if (!selectedCampaignId) return;

    setSyncingComments(true);
    setControlError(null);
    try {
      const { data, error } = await snsSalesSupabase.functions.invoke(
        "sns-sales-comments-sync",
        { body: { campaignId: selectedCampaignId } },
      );
      if (error) {
        let message = error.message;
        const context = (error as { context?: Response }).context;
        if (context) {
          try {
            const payload = await context.clone().json();
            if (payload?.message) message = String(payload.message);
          } catch {}
        }
        throw new Error(message);
      }

      await loadCampaignControl(selectedCampaignId);
      setNotice(
        `댓글 동기화 완료 · 확인 ${Number(data?.seen || 0)}개 · 트리거 ${Number(data?.matched || 0)}개`,
      );
    } catch (error) {
      setControlError(
        error instanceof Error ? error.message : "댓글 동기화에 실패했습니다.",
      );
    } finally {
      setSyncingComments(false);
    }
  }

  function validatePublishInput() {
    if (!session || !connection) return "Instagram 계정 연결이 필요합니다.";
    if (!selectedMedia.length) return "게시할 영상 또는 이미지를 선택해주세요.";
    if (mediaKind === "video" && selectedMedia.length !== 1) {
      return "영상은 한 번에 1개만 게시할 수 있습니다.";
    }
    if (mediaKind === "image" && selectedMedia.length > 10) {
      return "이미지는 최대 10장까지 게시할 수 있습니다.";
    }
    if (!description.trim()) return "상세설명을 입력해주세요.";
    const numericPrice = Number(price);
    if (!Number.isInteger(numericPrice) || numericPrice <= 0) {
      return "결제 금액을 정확히 입력해주세요.";
    }
    if (!triggerKeyword.trim()) return "댓글 트리거를 입력해주세요.";
    return null;
  }

  async function handlePublish() {
    const validationError = validatePublishInput();
    if (validationError) {
      setNotice(validationError);
      return;
    }
    if (!session || !connection) return;

    const campaignId = crypto.randomUUID();
    const uploadedPaths: string[] = [];
    let publishStarted = false;

    setPublishing(true);
    setPublishError(null);
    setPublishedUrl(null);
    setPublishMessage("미디어를 안전하게 업로드하는 중입니다...");

    try {
      const uploadedMedia: Array<{
        path: string;
        name: string;
        type: string;
        byteSize: number;
        sortOrder: number;
      }> = [];

      for (let index = 0; index < selectedMedia.length; index += 1) {
        const item = selectedMedia[index];
        const extension = item.name.includes(".")
          ? item.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin"
          : "bin";
        const path = `users/${session.user.id}/campaigns/${campaignId}/${String(index + 1).padStart(2, "0")}-${item.id}.${extension}`;

        setPublishMessage(
          selectedMedia.length > 1
            ? `미디어 업로드 중... ${index + 1}/${selectedMedia.length}`
            : "미디어를 안전하게 업로드하는 중입니다...",
        );

        const { error: uploadError } = await snsSalesSupabase.storage
          .from("sns-sales-media")
          .upload(path, item.file, {
            contentType: item.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
        uploadedMedia.push({
          path,
          name: item.name,
          type: item.type,
          byteSize: item.file.size,
          sortOrder: index,
        });
      }

      setPublishMessage("Instagram 게시 준비 중입니다...");

      const { data: startData, error: startError } =
        await snsSalesSupabase.functions.invoke("sns-sales-instagram-publish-start", {
          body: {
            campaignId,
            connectionId: connection.id,
            mediaKind,
            price: Number(price),
            description: description.trim(),
            triggerKeyword: triggerKeyword.trim(),
            media: uploadedMedia,
          },
        });

      if (startError) {
        let message = startError.message;
        const context = (startError as { context?: Response }).context;
        if (context) {
          try {
            const payload = await context.clone().json();
            if (payload?.message) message = String(payload.message);
          } catch {}
        }
        throw new Error(message);
      }
      if (!startData?.ok) {
        throw new Error(startData?.message || "Instagram 게시 준비에 실패했습니다.");
      }
      publishStarted = true;

      setPublishMessage(
        mediaKind === "video"
          ? "Instagram에서 영상을 처리하는 중입니다..."
          : "Instagram에서 게시물을 처리하는 중입니다...",
      );

      let transientFailures = 0;
      for (let attempt = 0; attempt < 80; attempt += 1) {
        await sleep(attempt === 0 ? 1800 : 3000);

        const { data: statusData, error: statusError } =
          await snsSalesSupabase.functions.invoke("sns-sales-instagram-publish-status", {
            body: { campaignId },
          });

        if (statusError) {
          transientFailures += 1;
          if (transientFailures >= 4) throw statusError;
          continue;
        }
        transientFailures = 0;

        if (statusData?.status === "published") {
          setPublishedUrl(statusData.permalink || null);
          setPublishMessage("Instagram 게시가 완료되었습니다.");
          setPublishing(false);
          setNotice("Instagram 게시가 완료되었습니다.");
          await loadCampaigns(campaignId);
          setSelectedCampaignId(campaignId);
          setAppView("manage");
          return;
        }

        if (statusData?.status === "failed") {
          throw new Error(statusData?.message || "Instagram 게시에 실패했습니다.");
        }

        if (statusData?.instagramStatus) {
          setPublishMessage(
            mediaKind === "video"
              ? `Instagram에서 영상을 처리하는 중입니다... (${statusData.instagramStatus})`
              : "Instagram에서 게시물을 처리하는 중입니다...",
          );
        }
      }

      throw new Error(
        "Instagram 미디어 처리 시간이 길어지고 있습니다. 잠시 후 다시 시도해주세요.",
      );
    } catch (error) {
      if (!publishStarted && uploadedPaths.length) {
        await snsSalesSupabase.storage
          .from("sns-sales-media")
          .remove(uploadedPaths)
          .catch(() => undefined);
      }

      const message =
        error instanceof Error ? error.message : "Instagram 게시 중 오류가 발생했습니다.";
      setPublishError(message);
      setPublishMessage(null);
      setPublishing(false);
    }
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
    void loadCampaigns();
    // Connection and campaigns intentionally follow session changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id, authReady]);

  useEffect(() => {
    if (!selectedCampaignId || appView !== "manage") {
      setComments([]);
      setQueue([]);
      return;
    }
    void loadCampaignControl(selectedCampaignId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaignId, appView]);

  useEffect(() => {
    if (!session) return;

    const campaignChannel = snsSalesSupabase
      .channel(`sns-sales-campaigns-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sns_sales_campaigns",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          void loadCampaigns();
        },
      )
      .subscribe();

    return () => {
      void snsSalesSupabase.removeChannel(campaignChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  useEffect(() => {
    if (!session || !selectedCampaignId || appView !== "manage") return;

    const liveChannel = snsSalesSupabase
      .channel(`sns-sales-live-${selectedCampaignId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sns_sales_comments",
          filter: `campaign_id=eq.${selectedCampaignId}`,
        },
        () => {
          void loadCampaignControl(selectedCampaignId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sns_sales_purchase_queue",
          filter: `campaign_id=eq.${selectedCampaignId}`,
        },
        () => {
          void loadCampaignControl(selectedCampaignId);
        },
      )
      .subscribe();

    return () => {
      void snsSalesSupabase.removeChannel(liveChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id, selectedCampaignId, appView]);

  useEffect(() => {
    if (appView !== "manage") return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [appView]);

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
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:rgb(9_41_68_/_22%)] pb-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.13em] text-[var(--terracotta)]">
            PRACTICE TOOL
          </p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.035em] sm:text-[28px]">
            SNS 판매 자동화
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[color:rgb(9_41_68_/_72%)]">
            Instagram 계정을 연결하고 판매 콘텐츠를 준비합니다. 실제 연결 상태와
            게시 상태만 화면에 표시합니다.
          </p>
        </div>
        <span className="border border-[color:rgb(9_41_68_/_22%)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.07em] text-[color:rgb(9_41_68_/_72%)]">
          INSTAGRAM SALES AUTOMATION
        </span>
      </section>

      {connected ? (
        <div className="mt-4 flex items-center justify-between gap-4 border-b border-[color:rgb(9_41_68_/_16%)] pb-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAppView("create")}
              className={
                appView === "create"
                  ? "bg-[var(--navy)] px-4 py-2 text-[11px] font-semibold text-white"
                  : "border border-[color:rgb(9_41_68_/_20%)] px-4 py-2 text-[11px] font-semibold"
              }
            >
              + 새 판매 등록
            </button>
            <button
              type="button"
              onClick={() => setAppView("manage")}
              className={
                appView === "manage"
                  ? "bg-[var(--navy)] px-4 py-2 text-[11px] font-semibold text-white"
                  : "border border-[color:rgb(9_41_68_/_20%)] px-4 py-2 text-[11px] font-semibold"
              }
            >
              판매 관리 {campaigns.length ? `(${campaigns.length})` : ""}
            </button>
          </div>
          <span className="text-[10px] text-[color:rgb(9_41_68_/_55%)]">
            게시물마다 댓글·구매 순번을 독립적으로 관리합니다.
          </span>
        </div>
      ) : null}

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

      {appView === "create" ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="border border-[color:rgb(9_41_68_/_22%)] bg-[color:rgb(255_255_255_/_34%)] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="flex items-baseline gap-1.5 text-[16px] font-semibold">
                  <span className="font-handwriting text-[23px] leading-none font-normal tracking-[-0.03em]">
                    Instagram
                  </span>
                  <span>계정</span>
                </h2>
                {connected ? (
                  <p className="mt-1 truncate text-[11px] text-[color:rgb(9_41_68_/_66%)]">
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
                      ? "inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#256b3d]"
                      : "inline-flex items-center gap-1.5 text-[11px] font-semibold text-[color:rgb(9_41_68_/_58%)]"
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
                    className="border border-[color:rgb(9_41_68_/_22%)] px-2.5 py-1 text-[10px] font-semibold text-[color:rgb(9_41_68_/_68%)] transition-opacity hover:opacity-100"
                  >
                    {accountExpanded ? "접기" : "관리"}
                  </button>
                ) : null}
              </div>
            </div>

            {!connected ? (
              <>
                <div className="mt-3 space-y-1">
                  <p className="text-[12px] font-semibold leading-5 text-[#a63434]">
                    Business 또는 Creator 계정만 연결 가능합니다.
                  </p>
                  <p className="text-[11px] leading-5 text-[color:rgb(9_41_68_/_62%)]">
                    계정 연결이 완료되면 콘텐츠 등록과 판매 자동화를 시작할 수 있습니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleInstagramConnect}
                  disabled={connecting || connectionLoading}
                  className="mt-3 h-9 w-full bg-[var(--navy)] px-3 text-[12px] font-semibold text-[#fffaf2] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {connecting ? "연결 준비 중..." : "Instagram 계정 연결하기"}
                </button>
              </>
            ) : accountExpanded ? (
              <div className="mt-3 border-t border-[color:rgb(9_41_68_/_9%)] pt-3">
                <div className="flex items-center justify-between gap-3 text-[11px]">
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
                  className="mt-3 h-8 w-full border border-[color:rgb(9_41_68_/_22%)] px-3 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {disconnecting ? "연결 해제 중..." : "Instagram 연결 해제"}
                </button>
              </div>
            ) : null}
          </section>

          <section className="border border-[color:rgb(9_41_68_/_17%)] px-3.5 py-3">
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div>
                <span className="block opacity-42">계정</span>
                <b className="mt-1 block text-[11px]">{connected ? "확인" : "대기"}</b>
              </div>
              <div className="border-x border-[color:rgb(9_41_68_/_10%)]">
                <span className="block opacity-42">콘텐츠</span>
                <b className="mt-1 block text-[11px]">{selectedMedia.length ? "선택" : "대기"}</b>
              </div>
              <div>
                <span className="block opacity-42">게시</span>
                <b className="mt-1 block text-[11px]">게시 전</b>
              </div>
            </div>
          </section>
        </aside>

        <section className="relative border border-[color:rgb(9_41_68_/_22%)] bg-[color:rgb(255_255_255_/_28%)]">
          {!connected ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[color:rgb(244_239_230_/_82%)] backdrop-blur-[1px]">
              <div className="max-w-sm px-6 text-center">
                <div className="mx-auto flex size-9 items-center justify-center border border-[color:rgb(9_41_68_/_22%)] text-sm">
                  ↗
                </div>
                <b className="mt-3 block text-[14px]">Instagram 연결이 필요합니다.</b>
                <p className="mt-1 text-[12px] leading-5 text-[color:rgb(9_41_68_/_60%)]">
                  계정 연결이 확인되면 콘텐츠 등록 영역이 활성화됩니다.
                </p>
              </div>
            </div>
          ) : null}

          <div className={connected ? "" : "pointer-events-none select-none opacity-28"}>
            {workspaceView === "content" ? (
              <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.09em] text-[color:rgb(9_41_68_/_58%)]">
                        NEW SALE CONTENT
                      </p>
                      <h2 className="mt-1 text-[16px] font-semibold">새 판매 콘텐츠</h2>
                    </div>
                    <div className="flex border border-[color:rgb(9_41_68_/_15%)] p-0.5">
                      <button
                        type="button"
                        onClick={() => chooseKind("video")}
                        className={
                          mediaKind === "video"
                            ? "bg-[var(--navy)] px-3 py-1.5 text-[11px] font-semibold text-white"
                            : "px-3 py-1.5 text-[11px] font-semibold text-[color:rgb(9_41_68_/_58%)]"
                        }
                      >
                        동영상
                      </button>
                      <button
                        type="button"
                        onClick={() => chooseKind("image")}
                        className={
                          mediaKind === "image"
                            ? "bg-[var(--navy)] px-3 py-1.5 text-[11px] font-semibold text-white"
                            : "px-3 py-1.5 text-[11px] font-semibold text-[color:rgb(9_41_68_/_58%)]"
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
                    <b className="mt-2 text-[13px]">
                      {mediaKind === "video" ? "동영상 추가" : "이미지 추가"}
                    </b>
                    <span className="mt-1 text-[11px] text-[color:rgb(9_41_68_/_55%)]">
                      {mediaKind === "video"
                        ? "동영상은 한 번에 1개만 선택할 수 있습니다."
                        : "이미지는 최대 10장까지 선택할 수 있습니다."}
                    </span>
                  </button>

                  {selectedMedia.length ? (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {selectedMedia.map((item, index) => (
                        <div
                          key={item.id}
                          className="relative aspect-square overflow-hidden border border-[color:rgb(9_41_68_/_17%)] bg-black/5"
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
                          <button
                            type="button"
                            onClick={() => removeMedia(item.id)}
                            className="absolute top-1 right-1 flex size-5 items-center justify-center bg-[color:rgb(9_41_68_/_82%)] text-[12px] font-bold leading-none text-white transition-opacity hover:opacity-75"
                            aria-label={`${item.name} 삭제`}
                            title="선택 취소"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <p className="mt-2 text-[11px] text-[color:rgb(9_41_68_/_55%)]">{previewLabel}</p>
                </div>

                <div className="border-t border-[color:rgb(9_41_68_/_17%)] p-4 lg:border-t-0 lg:border-l">
                  <p className="text-[11px] font-bold tracking-[0.09em] text-[color:rgb(9_41_68_/_58%)]">
                    SALES SETTINGS
                  </p>
                  <div className="mt-3 space-y-3">
                    <label className="block text-[11px] font-semibold">
                      결제 금액
                      <div className="relative mt-1">
                        <input
                          type="number"
                          min="0"
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                          className="h-9 w-full border border-[color:rgb(9_41_68_/_22%)] bg-transparent px-3 pr-8 text-[12px] outline-none focus:border-[var(--navy)]"
                          placeholder="59000"
                        />
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-[color:rgb(9_41_68_/_50%)]">
                          원
                        </span>
                      </div>
                    </label>
                    <label className="block text-[11px] font-semibold">
                      상세설명
                      <span className="mt-1 block text-[10px] font-normal leading-4 text-[color:rgb(9_41_68_/_58%)]">
                        상품명과 가격을 포함해서 상세설명을 적어주세요.
                      </span>
                      <textarea
                        rows={6}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="mt-2 w-full resize-none border border-[color:rgb(9_41_68_/_22%)] bg-transparent px-3 py-2 text-[12px] leading-5 outline-none focus:border-[var(--navy)]"
                        placeholder={'예: 빈티지 데님 재킷입니다.\n판매가는 59,000원이며 상태는 양호합니다.\n구매를 원하시면 댓글에 "구매"라고 남겨주세요.'}
                      />
                    </label>
                    <label className="block text-[11px] font-semibold">
                      댓글 트리거
                      <input
                        value={triggerKeyword}
                        onChange={(event) => setTriggerKeyword(event.target.value)}
                        className="mt-1 h-9 w-full border border-[color:rgb(9_41_68_/_22%)] bg-transparent px-3 text-[12px] outline-none focus:border-[var(--navy)]"
                        placeholder="예: 구매"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWorkspaceView("preview")}
                    className="mt-4 h-9 w-full border border-[color:rgb(9_41_68_/_22%)] px-3 text-[11px] font-semibold transition-colors hover:bg-[color:rgb(9_41_68_/_3%)]"
                  >
                    게시 전 미리보기 확인 →
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.09em] text-[color:rgb(9_41_68_/_58%)]">
                        INSTAGRAM PREVIEW
                      </p>
                      <h2 className="mt-1 text-[16px] font-semibold">게시물 미리보기</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWorkspaceView("content")}
                      className="border border-[color:rgb(9_41_68_/_22%)] px-3 py-1.5 text-[11px] font-semibold"
                    >
                      ← 판매 내용 수정
                    </button>
                  </div>

                  <div className="mx-auto mt-4 max-w-[360px] border border-[color:rgb(9_41_68_/_22%)] bg-[#faf7f1]">
                    <div className="flex h-10 items-center gap-2 border-b border-[color:rgb(9_41_68_/_10%)] px-3">
                      <span className="size-6 rounded-full border border-[color:rgb(9_41_68_/_22%)]" />
                      <b className="text-[11px]">@{connection?.instagram_username || "instagram"}</b>
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
                        <span className="text-[11px] text-[color:rgb(9_41_68_/_50%)]">미디어 미리보기</span>
                      )}
                    </div>
                    <div className="px-3 py-2.5">
                      <div className="text-[15px] tracking-[0.24em]">♡ ◯ ✈</div>
                      <div className="mt-2 text-[11px] leading-5">
                        <b>@{connection?.instagram_username || "instagram"}</b>
                        <p className="mt-1 whitespace-pre-wrap text-[color:rgb(9_41_68_/_78%)]">
                          {description.trim() || "상품명과 가격을 포함한 상세설명을 입력해주세요."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between border-t border-[color:rgb(9_41_68_/_17%)] p-4 lg:border-t-0 lg:border-l">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.09em] text-[color:rgb(9_41_68_/_58%)]">
                      FINAL CHECK
                    </p>
                    <div className="mt-3 space-y-2 text-[11px]">
                      <div className="flex justify-between gap-3 border-b border-[color:rgb(9_41_68_/_8%)] pb-2">
                        <span className="opacity-45">계정</span>
                        <b>@{connection?.instagram_username || "instagram"}</b>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-[color:rgb(9_41_68_/_8%)] pb-2">
                        <span className="opacity-55">미디어</span>
                        <b>{selectedMedia.length ? `${selectedMedia.length}개` : "미선택"}</b>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-[color:rgb(9_41_68_/_8%)] pb-2">
                        <span className="opacity-55">결제 금액</span>
                        <b>{price ? `${Number(price).toLocaleString("ko-KR")}원` : "미입력"}</b>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-[color:rgb(9_41_68_/_8%)] pb-2">
                        <span className="opacity-55">댓글 트리거</span>
                        <b>{triggerKeyword.trim() || "미입력"}</b>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="opacity-55">게시 상태</span>
                        <b>게시 전</b>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[11px] leading-5 text-[color:rgb(9_41_68_/_60%)]">
                      실제 Instagram 계정과 미디어를 확인한 뒤 게시하세요.
                    </p>
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={publishing || Boolean(publishedUrl)}
                      className="mt-3 h-10 w-full bg-[var(--terracotta)] px-4 text-[12px] font-semibold text-[#fffaf2] transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {publishing
                        ? "게시 처리 중..."
                        : publishedUrl
                          ? "Instagram 게시 완료"
                          : "Instagram에 게시"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      ) : null}

      {appView === "manage" && connected ? (
        <section className="mt-5 border border-[color:rgb(9_41_68_/_20%)] bg-[color:rgb(255_255_255_/_26%)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:rgb(9_41_68_/_16%)] px-4 py-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.1em] text-[var(--terracotta)]">
                SALES CONTROL CENTER
              </p>
              <h2 className="mt-1 text-[18px] font-semibold">판매 캠페인 관리</h2>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="inline-flex items-center gap-1.5 text-[#256b3d]">
                <i className="size-2 rounded-full bg-[#39a660]" />
                Realtime
              </span>
              <span className="text-[color:rgb(9_41_68_/_52%)]">
                Webhook 수신 시 자동 갱신
              </span>
            </div>
          </div>

          {controlError ? (
            <div className="border-b border-[#b44343]/20 bg-[#b44343]/5 px-4 py-2.5 text-[11px] text-[#9b3434]">
              {controlError}
            </div>
          ) : null}

          <div className="grid min-h-[520px] xl:grid-cols-[310px_minmax(0,1fr)_330px]">
            <div className="border-b border-[color:rgb(9_41_68_/_15%)] xl:border-r xl:border-b-0">
              <div className="flex items-center justify-between px-4 py-3">
                <b className="text-[12px]">판매 게시물</b>
                <span className="text-[10px] text-[color:rgb(9_41_68_/_50%)]">
                  {campaigns.length}개
                </span>
              </div>

              <div className="max-h-[560px] overflow-y-auto border-t border-[color:rgb(9_41_68_/_10%)]">
                {campaignsLoading ? (
                  <p className="px-4 py-5 text-[11px] opacity-55">불러오는 중...</p>
                ) : campaigns.length ? (
                  campaigns.map((campaign, index) => {
                    const active = campaign.id === selectedCampaignId;
                    return (
                      <button
                        key={campaign.id}
                        type="button"
                        onClick={() => setSelectedCampaignId(campaign.id)}
                        className={
                          active
                            ? "block w-full border-b border-[color:rgb(9_41_68_/_12%)] bg-[color:rgb(9_41_68_/_7%)] px-4 py-3 text-left"
                            : "block w-full border-b border-[color:rgb(9_41_68_/_10%)] px-4 py-3 text-left hover:bg-[color:rgb(9_41_68_/_3%)]"
                        }
                      >
                        <div className="flex items-center justify-between gap-2">
                          <b className="text-[11px]">판매 #{campaigns.length - index}</b>
                          <span className={
                            campaign.status === "active"
                              ? "text-[9px] font-semibold text-[#256b3d]"
                              : "text-[9px] font-semibold opacity-50"
                          }>
                            {campaign.status === "active" ? "판매 중" : campaign.status}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[color:rgb(9_41_68_/_68%)]">
                          {campaign.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[9px] text-[color:rgb(9_41_68_/_48%)]">
                          <span>{campaign.price ? `${campaign.price.toLocaleString("ko-KR")}원` : "-"}</span>
                          <span>트리거 · {campaign.trigger_keyword}</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-[11px] opacity-55">아직 게시된 판매가 없습니다.</p>
                    <button
                      type="button"
                      onClick={() => setAppView("create")}
                      className="mt-3 text-[10px] font-semibold text-[var(--terracotta)]"
                    >
                      새 판매 등록하기 →
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-[color:rgb(9_41_68_/_15%)] xl:border-r xl:border-b-0">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <b className="text-[12px]">실시간 댓글</b>
                  {selectedCampaign ? (
                    <p className="mt-0.5 text-[9px] text-[color:rgb(9_41_68_/_50%)]">
                      {formatDateTime(selectedCampaign.published_at)} · 트리거 "{selectedCampaign.trigger_keyword}"
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={syncCampaignComments}
                  disabled={!selectedCampaignId || syncingComments}
                  className="border border-[color:rgb(9_41_68_/_20%)] px-3 py-1.5 text-[10px] font-semibold disabled:opacity-35"
                >
                  {syncingComments ? "동기화 중..." : "댓글 동기화"}
                </button>
              </div>

              <div className="max-h-[560px] overflow-y-auto border-t border-[color:rgb(9_41_68_/_10%)]">
                {!selectedCampaign ? (
                  <p className="px-4 py-8 text-center text-[11px] opacity-50">
                    관리할 게시물을 선택해주세요.
                  </p>
                ) : commentsLoading ? (
                  <p className="px-4 py-5 text-[11px] opacity-55">댓글 불러오는 중...</p>
                ) : comments.length ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={
                        comment.matched_trigger
                          ? "border-b border-[color:rgb(185_79_44_/_18%)] bg-[color:rgb(185_79_44_/_6%)] px-4 py-3"
                          : "border-b border-[color:rgb(9_41_68_/_9%)] px-4 py-3"
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <b className="text-[11px]">@{comment.instagram_username || "unknown"}</b>
                        <div className="flex items-center gap-2">
                          {comment.matched_trigger ? (
                            <span className="border border-[var(--terracotta)]/35 px-1.5 py-0.5 text-[9px] font-semibold text-[var(--terracotta)]">
                              트리거
                            </span>
                          ) : null}
                          <span className="text-[9px] text-[color:rgb(9_41_68_/_42%)]">
                            {formatDateTime(comment.commented_at || comment.received_at)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap text-[12px] leading-5">
                        {comment.comment_text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center">
                    <p className="text-[12px] font-semibold">아직 수신된 댓글이 없습니다.</p>
                    <p className="mt-1 text-[10px] leading-5 text-[color:rgb(9_41_68_/_52%)]">
                      Webhook이 연결되면 새 댓글이 자동으로 나타납니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <b className="text-[12px]">구매 대기열</b>
                  <p className="mt-0.5 text-[9px] text-[color:rgb(9_41_68_/_50%)]">
                    트리거 댓글만 순번에 등록
                  </p>
                </div>
                <span className="text-[10px] font-semibold">{queue.length}명</span>
              </div>

              <div className="max-h-[560px] overflow-y-auto border-t border-[color:rgb(9_41_68_/_10%)]">
                {queue.length ? (
                  queue.map((item) => (
                    <div
                      key={item.id}
                      className={
                        item.status === "reserved"
                          ? "border-b border-[#39a660]/20 bg-[#39a660]/5 px-4 py-3"
                          : "border-b border-[color:rgb(9_41_68_/_9%)] px-4 py-3"
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className={
                          item.status === "reserved"
                            ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-[10px] font-bold text-white"
                            : "flex size-7 shrink-0 items-center justify-center rounded-full border border-[color:rgb(9_41_68_/_22%)] text-[10px] font-bold"
                        }>
                          {item.queue_position}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <b className="truncate text-[11px]">@{item.instagram_username || "unknown"}</b>
                            <span className={
                              item.status === "reserved"
                                ? "text-[9px] font-semibold text-[#256b3d]"
                                : "text-[9px] font-semibold text-[color:rgb(9_41_68_/_52%)]"
                            }>
                              {queueStatusLabel(item.status)}
                            </span>
                          </div>
                          {item.status === "reserved" ? (
                            <div className="mt-1.5 flex items-center justify-between text-[10px]">
                              <span className="text-[color:rgb(9_41_68_/_52%)]">남은 시간</span>
                              <b className="font-mono text-[12px]">{formatRemaining(item.due_at)}</b>
                            </div>
                          ) : (
                            <p className="mt-1 text-[9px] text-[color:rgb(9_41_68_/_45%)]">
                              {formatDateTime(item.created_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center">
                    <p className="text-[12px] font-semibold">구매 대기자가 없습니다.</p>
                    <p className="mt-1 text-[10px] leading-5 text-[color:rgb(9_41_68_/_52%)]">
                      "{selectedCampaign?.trigger_keyword || "구매"}" 댓글이 들어오면 자동으로 순번을 부여합니다.
                    </p>
                  </div>
                )}
              </div>

              {selectedCampaign?.instagram_permalink ? (
                <div className="border-t border-[color:rgb(9_41_68_/_10%)] p-4">
                  <a
                    href={selectedCampaign.instagram_permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 items-center justify-center border border-[color:rgb(9_41_68_/_20%)] text-[10px] font-semibold"
                  >
                    Instagram 게시물 열기 ↗
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {publishMessage || publishError ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[color:rgb(9_41_68_/_32%)] px-5 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Instagram 게시 상태"
        >
          <div className="w-full max-w-[420px] border border-[color:rgb(9_41_68_/_22%)] bg-[#f4efe6] p-5 shadow-xl">
            <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--terracotta)]">
              INSTAGRAM PUBLISH
            </p>

            {publishError ? (
              <>
                <h2 className="mt-2 text-[17px] font-semibold">게시를 완료하지 못했습니다.</h2>
                <p className="mt-3 text-[12px] leading-5 text-[#9b3434]">
                  {publishError}
                </p>
                <button
                  type="button"
                  onClick={() => setPublishError(null)}
                  className="mt-4 h-9 w-full border border-[color:rgb(9_41_68_/_22%)] text-[11px] font-semibold"
                >
                  확인
                </button>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-[17px] font-semibold">
                  {publishedUrl ? "게시가 완료되었습니다." : "Instagram에 게시 중입니다."}
                </h2>
                <p className="mt-3 text-[12px] leading-5 text-[color:rgb(9_41_68_/_68%)]">
                  {publishMessage}
                </p>

                {!publishedUrl ? (
                  <div className="mt-4 h-1.5 overflow-hidden bg-[color:rgb(9_41_68_/_10%)]">
                    <div className="h-full w-1/2 animate-pulse bg-[var(--terracotta)]" />
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <a
                      href={publishedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 flex-1 items-center justify-center bg-[var(--navy)] px-3 text-[11px] font-semibold text-white"
                    >
                      Instagram에서 확인
                    </a>
                    <button
                      type="button"
                      onClick={() => setPublishMessage(null)}
                      className="h-9 border border-[color:rgb(9_41_68_/_22%)] px-4 text-[11px] font-semibold"
                    >
                      닫기
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}

      {loginOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[color:rgb(9_41_68_/_28%)] px-5 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="DECHIVE 로그인"
        >
          <div className="w-full max-w-[380px] border border-[color:rgb(9_41_68_/_22%)] bg-[#f4efe6] p-5 shadow-xl">
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

            <label className="mt-4 block text-[11px] font-semibold">
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
                className="mt-1 h-10 w-full border border-[color:rgb(9_41_68_/_22%)] bg-transparent px-3 text-[12px] outline-none focus:border-[var(--navy)]"
              />
            </label>

            <button
              type="button"
              onClick={sendLoginLink}
              disabled={authSending}
              className="mt-3 h-10 w-full bg-[var(--navy)] px-4 text-[12px] font-semibold text-[#fffaf2] disabled:opacity-40"
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
