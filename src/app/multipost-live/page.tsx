'use client';

import { upload } from "@vercel/blob/client";
import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type MetaPage = {
  id: string;
  name: string;
  instagramUsername?: string | null;
  hasInstagram?: boolean;
};

type Status = {
  config?: {
    meta: boolean;
    threads: boolean;
    tiktok: boolean;
    blob: boolean;
    appSecret: boolean;
  };
  meta?: {
    connected: boolean;
    pageName?: string;
    instagram?: string | null;
    instagramReady?: boolean;
  };
  metaPending?: { pages: MetaPage[] } | null;
  threads?: { connected: boolean };
  tiktok?: { connected: boolean };
};

type PublishResult = {
  platform: string;
  status: string;
  id?: string;
  message?: string;
};

const platforms = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["threads", "Threads"],
] as const;

export default function MultiPostLivePage() {
  const [status, setStatus] = useState<Status>({});
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<PublishResult[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metaBusy, setMetaBusy] = useState(false);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  async function refresh() {
    const response = await fetch("/api/multipost/status", { cache: "no-store" });
    setStatus(await response.json());
  }

  useEffect(() => {
    void refresh();
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, []);

  function toggle(platform: string) {
    setSelected((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  }

  async function selectMetaPage(pageId: string) {
    setMetaBusy(true);
    setError("");
    try {
      const response = await fetch("/api/multipost/oauth/meta/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Meta Page 연결 실패");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Meta Page 연결 실패");
    } finally {
      setMetaBusy(false);
    }
  }

  async function publish() {
    if (!file) return setError("영상을 먼저 선택하세요.");
    if (!selected.length) return setError("게시할 플랫폼을 하나 이상 선택하세요.");

    setBusy(true);
    setError("");
    setResults([]);
    setProgress(0);

    try {
      const blob = await upload(
        `class-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/multipost/upload",
          multipart: true,
          onUploadProgress: (event) => setProgress(event.percentage),
        },
      );

      const response = await fetch("/api/multipost/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: blob.url,
          title,
          text,
          platforms: selected,
          tiktokPrivacy: "SELF_ONLY",
          videoSize: file.size,
          videoType: file.type || "video/mp4",
        }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "게시 요청 실패");
      setResults(json.results || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  }

  const readyCount = [
    status.config?.meta,
    status.config?.threads,
    status.config?.tiktok,
    status.config?.blob,
    status.config?.appSecret,
  ].filter(Boolean).length;

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>DECHIVE CLASS · LIVE</p>
          <h1>내 계정을 연결하고<br />영상 하나를 실제로 보내봅니다.</h1>
          <p className={styles.lead}>
            수업 참가자 각자의 브라우저에 연결 정보가 분리되어 저장됩니다.
            다른 참가자의 계정이나 토큰은 보이지 않습니다.
          </p>
        </div>
        <div className={styles.ready}>{readyCount}/5 준비</div>
      </header>

      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.step}>01</span>
            <h2>계정 연결</h2>
            <p>각 플랫폼의 공식 로그인 화면으로 이동합니다.</p>
          </div>
          <button type="button" className={styles.smallButton} onClick={() => void refresh()}>
            상태 새로고침
          </button>
        </div>

        <div className={styles.channelGrid}>
          <Channel
            name="Facebook"
            detail={status.meta?.connected ? status.meta.pageName || "Facebook Page" : "Facebook Page 연결"}
            connected={Boolean(status.meta?.connected)}
            configured={Boolean(status.config?.meta)}
            href="/api/multipost/oauth/meta/start?target=facebook"
          />
          <Channel
            name="Instagram"
            detail={
              status.meta?.instagramReady
                ? `@${status.meta.instagram || "instagram"}`
                : status.meta?.connected
                  ? "Page에 Professional 계정 연결 필요"
                  : "Instagram Professional 연결"
            }
            connected={Boolean(status.meta?.instagramReady)}
            configured={Boolean(status.config?.meta)}
            href="/api/multipost/oauth/meta/start?target=instagram"
          />
          <Channel
            name="TikTok"
            detail="TikTok 계정 연결"
            connected={Boolean(status.tiktok?.connected)}
            configured={Boolean(status.config?.tiktok)}
            href="/api/multipost/oauth/tiktok/start"
          />
          <Channel
            name="Threads"
            detail="Threads 계정 연결"
            connected={Boolean(status.threads?.connected)}
            configured={Boolean(status.config?.threads)}
            href="/api/multipost/oauth/threads/start"
          />
        </div>

        {status.metaPending?.pages?.length ? (
          <div className={styles.pagePicker}>
            <strong>게시할 Facebook Page를 선택하세요.</strong>
            <div className={styles.pageList}>
              {status.metaPending.pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  disabled={metaBusy}
                  onClick={() => void selectMetaPage(page.id)}
                  className={styles.pageButton}
                >
                  <span>{page.name}</span>
                  <small>
                    {page.hasInstagram
                      ? `Instagram @${page.instagramUsername || "연결됨"}`
                      : "Instagram 연결 없음"}
                  </small>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.step}>02</span>
            <h2>영상 하나 올리기</h2>
            <p>짧은 MP4 영상을 권장합니다.</p>
          </div>
          {busy ? <span className={styles.progress}>업로드 {Math.round(progress)}%</span> : null}
        </div>

        <label className={styles.uploadBox}>
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            hidden
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <strong>{file ? file.name : "영상 선택"}</strong>
          <span>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "클릭해서 영상 파일을 선택하세요."}</span>
        </label>

        {preview ? <video src={preview} controls className={styles.preview} /> : null}

        <div className={styles.formGrid}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="기본 제목"
            className={styles.input}
          />
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="기본 게시글"
            className={styles.textarea}
          />
        </div>

        <div className={styles.platforms}>
          {platforms.map(([value, label]) => (
            <label key={value} className={styles.platform}>
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => toggle(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          className={styles.publishButton}
          disabled={busy}
          onClick={() => void publish()}
        >
          {busy ? "업로드·게시 처리 중..." : "선택한 채널로 보내기"}
        </button>

        {error ? <div className={styles.error}>{error}</div> : null}

        {results.length ? (
          <div className={styles.results}>
            {results.map((result) => (
              <div key={result.platform} className={styles.resultRow}>
                <div>
                  <strong>{result.platform}</strong>
                  <small>{result.message || result.id || "완료"}</small>
                </div>
                <span className={result.status === "failed" ? styles.failed : styles.success}>
                  {result.status}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className={styles.notice}>
        <strong>오늘 수업에서 확인할 것</strong>
        <p>
          로그인 → 영상 업로드 → 플랫폼 선택 → 게시 요청 → 성공/실패 상태 확인까지가
          기본 자동화의 한 사이클입니다. 이후 수업에서 플랫폼별 제목·자막·CTA 규칙을
          하나씩 추가합니다.
        </p>
      </section>
    </main>
  );
}

function Channel({
  name,
  detail,
  connected,
  configured,
  href,
}: {
  name: string;
  detail: string;
  connected: boolean;
  configured: boolean;
  href: string;
}) {
  return (
    <article className={styles.channel}>
      <div className={styles.channelTop}>
        <strong>{name}</strong>
        <span className={connected ? styles.connected : styles.disconnected}>
          {connected ? "연결됨" : configured ? "연결 전" : "설정 필요"}
        </span>
      </div>
      <p>{detail}</p>
      {connected ? (
        <span className={styles.connectedButton}>연결 완료 ✓</span>
      ) : configured ? (
        <a href={href} className={styles.connectButton}>계정 연결</a>
      ) : (
        <span className={styles.disabledButton}>개발자 앱 설정 필요</span>
      )}
    </article>
  );
}
