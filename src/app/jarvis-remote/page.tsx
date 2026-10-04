"use client";

import { useMemo, useState } from "react";

const COMMAND_URL =
  "https://pexoeftnkbcowauxhopf.supabase.co/functions/v1/jarvis-command";

type SourceItem = { url?: string; title?: string };
type JobResult = {
  sanity_document_id?: string;
  review_title?: string;
  title?: string;
  review_summary?: string;
  summary?: string;
  draft?: { title?: string; summary?: string; body_markdown?: string };
  verification?: { score?: number };
  sources?: SourceItem[];
};
type JobView = {
  job_id?: string;
  source_code?: string;
  status?: string;
  result?: JobResult;
  last_error?: string | null;
  result_url?: string | null;
  published_url?: string | null;
  published_at?: string | null;
  channel_status?: string | null;
  provider_attempts?: number;
};
type CommandView = {
  status?: string;
  result?: { jobs?: JobView[] };
};
type JarvisResponse = {
  ok?: boolean;
  error?: string;
  intent?: string;
  command_id?: string;
  command?: CommandView;
  knowledge_job?: JobView | null;
  providers?: { groq?: boolean; sanity?: boolean };
  message?: string;
};

const card = {
  border: "1px solid #272a2f",
  background: "#14161a",
  borderRadius: 18,
  padding: 16,
  margin: "14px 0",
} as const;

const inputStyle = {
  width: "100%",
  border: "1px solid #30343a",
  background: "#0f1114",
  color: "#fff",
  padding: 13,
  borderRadius: 12,
  fontSize: 16,
} as const;

const buttonStyle = {
  border: 0,
  borderRadius: 12,
  padding: "12px 14px",
  fontWeight: 750,
  fontSize: 15,
  background: "#f3f4f6",
  color: "#111",
  cursor: "pointer",
} as const;

const secondaryButton = {
  ...buttonStyle,
  background: "#22262b",
  color: "#f3f4f6",
  border: "1px solid #353a40",
} as const;

function stored(key: string) {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(key) ?? "";
}

function humanKnowledgeState(job: JobView) {
  const status = job.status ?? "";
  const publishedUrl = job.result_url || job.published_url || null;
  const providerLimited =
    /429|rate limit|tokens per day|quota/i.test(job.last_error ?? "");

  if (status === "done" && publishedUrl) {
    return {
      title: "✅ 발행 완료",
      detail: "DECHIVE에 공개됐고 실제 페이지 확인까지 끝났습니다.",
      color: "#8bd49c",
      background: "#102417",
      border: "#2f7a45",
    };
  }

  if (status === "post_verify") {
    return {
      title: "🟢 발행 후 확인 중",
      detail: "Sanity 발행은 끝났고 DECHIVE 실제 페이지가 정상인지 확인하고 있습니다.",
      color: "#8bd49c",
      background: "#102417",
      border: "#2f7a45",
    };
  }

  if (status === "publishing") {
    return {
      title: "🟡 아직 발행 안 됨 · 발행 처리 중",
      detail: "사람 검증 승인이 끝났고 Sanity에 실제 발행하는 중입니다.",
      color: "#f4d27a",
      background: "#292313",
      border: "#7a6530",
    };
  }

  if (status === "waiting_for_user" && job.result?.sanity_document_id) {
    return {
      title: "🟠 아직 발행 안 됨 · 사람 검증 대기",
      detail: "글과 검증은 끝났습니다. 내용을 확인하고 승인해야 실제 발행됩니다.",
      color: "#f0b36a",
      background: "#291d12",
      border: "#7a4f28",
    };
  }

  if (status === "waiting_for_capability") {
    return {
      title: "🟡 아직 발행 안 됨 · Sanity 저장 대기",
      detail: "JARVIS 검증을 통과했고 Sanity review 문서를 만드는 단계입니다.",
      color: "#f4d27a",
      background: "#292313",
      border: "#7a6530",
    };
  }

  if (status === "verifying") {
    return {
      title: "🔎 아직 발행 안 됨 · 검증 중",
      detail: "작성된 글의 사실, 출처, 과장 여부를 독립적으로 다시 확인하고 있습니다.",
      color: "#9fc5ff",
      background: "#131d2a",
      border: "#355b86",
    };
  }

  if (status === "generating") {
    return {
      title: "✍️ 아직 발행 안 됨 · 글 작성 중",
      detail: "확인한 자료를 바탕으로 Knowledge 원고를 작성하고 있습니다.",
      color: "#9fc5ff",
      background: "#131d2a",
      border: "#355b86",
    };
  }

  if (status === "researching") {
    return {
      title: "🔍 아직 발행 안 됨 · 자료 조사 중",
      detail: "주제에 필요한 공식 자료와 근거를 조사하고 있습니다.",
      color: "#9fc5ff",
      background: "#131d2a",
      border: "#355b86",
    };
  }

  if (status === "retry_wait" || status === "waiting_for_provider") {
    return {
      title: "⏳ 아직 발행 안 됨 · 자동 재시도 대기",
      detail: providerLimited
        ? "Groq 무료 사용 한도 때문에 잠시 기다리는 중입니다. JARVIS가 자동으로 다시 시도합니다."
        : "검증에서 보완할 점이 발견됐거나 Provider 응답을 기다리는 중입니다. 자동으로 다시 시도합니다.",
      color: "#f4d27a",
      background: "#292313",
      border: "#7a6530",
    };
  }

  if (status === "waiting_for_user") {
    return {
      title: "⚠️ 아직 발행 안 됨 · 확인 필요",
      detail: "자동 처리를 계속하기 전에 사람이 확인해야 할 문제가 생겼습니다.",
      color: "#ffad8a",
      background: "#2b1712",
      border: "#824632",
    };
  }

  if (status === "failed" || status === "rejected") {
    return {
      title: "❌ 발행 안 됨 · 작업 실패",
      detail: "발행하지 않았습니다. 원인을 확인한 뒤 다시 실행해야 합니다.",
      color: "#ff8f8f",
      background: "#2b1414",
      border: "#7a3030",
    };
  }

  return {
    title: "⏳ 아직 발행 안 됨 · 작업 준비 중",
    detail: "JARVIS가 작업을 접수했고 실행 순서를 기다리거나 시작하는 중입니다.",
    color: "#b9bec7",
    background: "#17191d",
    border: "#343941",
  };
}

export default function JarvisRemotePage() {
  const [deviceKey, setDeviceKey] = useState(() => stored("jarvis_device_key"));
  const [deviceToken, setDeviceToken] = useState(() =>
    stored("jarvis_device_token"),
  );
  const [commandText, setCommandText] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [sanityKey, setSanityKey] = useState("");
  const [status, setStatus] = useState("대기 중");
  const [result, setResult] = useState<JarvisResponse | null>(null);
  const [activeCommandId, setActiveCommandId] = useState<string | null>(null);
  const [pairSaved, setPairSaved] = useState(() =>
    Boolean(stored("jarvis_device_key") && stored("jarvis_device_token")),
  );
  const [providerState, setProviderState] = useState<{
    groq: boolean;
    sanity: boolean;
  } | null>(null);
  const [providerChecking, setProviderChecking] = useState(false);
  const [providerCheckedAt, setProviderCheckedAt] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [knowledgeJob, setKnowledgeJob] = useState<JobView | null>(null);

  const approvalJobs = useMemo(() => {
    const jobs = knowledgeJob
      ? [knowledgeJob]
      : result?.command?.result?.jobs ?? [];
    return jobs.filter(
      (job) =>
        job.status === "waiting_for_user" &&
        Boolean(job.result?.sanity_document_id),
    );
  }, [knowledgeJob, result]);

  async function callJarvis(
    body: Record<string, unknown>,
    silent = false,
  ): Promise<JarvisResponse | null> {
    if (!deviceKey.trim() || !deviceToken.trim()) {
      setStatus("먼저 Device Key와 Device Token을 입력하세요.");
      return null;
    }

    if (!silent) setStatus("JARVIS에 전달 중...");

    try {
      const response = await fetch(COMMAND_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-jarvis-device": deviceKey.trim(),
          "x-jarvis-token": deviceToken.trim(),
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json().catch(() => ({}))) as JarvisResponse;
      setResult(data);
      if (data.knowledge_job) {
        setKnowledgeJob(data.knowledge_job);
      } else {
        const jobs = data.command?.result?.jobs ?? [];
        const knowledge = jobs.find((job) => Boolean(job.source_code));
        if (knowledge) setKnowledgeJob(knowledge);
      }
      if (!silent) setStatus(response.ok ? "전달 완료" : data.error ?? "오류");
      return data;
    } catch (error) {
      setStatus(
        error instanceof Error
          ? "네트워크 오류: " + error.message
          : "네트워크 오류",
      );
      return null;
    }
  }

  async function pollCommand(commandId: string) {
    setActiveCommandId(commandId);
    setStatus("JARVIS 작업 진행 중...");

    for (let index = 0; index < 120; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const data = await callJarvis(
        { action: "command_status", commandId },
        true,
      );
      const command = data?.command;
      if (index % 2 === 0) {
        await callJarvis({ action: "knowledge_status" }, true);
      }
      if (!command) continue;

      if (command.status === "waiting_for_user") {
        await callJarvis({ action: "knowledge_status" }, true);
        setStatus("사람 검증이 필요합니다.");
        return;
      }
      if (command.status === "done") {
        await callJarvis({ action: "knowledge_status" }, true);
        setStatus("작업 완료");
        setActiveCommandId(null);
        return;
      }
      if (command.status === "failed" || command.status === "cancelled") {
        setStatus("확인이 필요합니다.");
        setActiveCommandId(null);
        return;
      }
    }

    setStatus("작업은 계속 진행 중입니다. 오늘 상태에서 다시 확인하세요.");
  }

  async function checkProviderStatus() {
    if (providerChecking) return;
    setProviderChecking(true);
    setActiveAction("provider-check");
    setLastAction("Provider 상태 확인 버튼을 눌렀습니다.");
    setStatus("Provider 상태 확인 중...");

    const data = await callJarvis({ action: "provider_status" }, true);
    if (data?.providers) {
      setProviderState({
        groq: Boolean(data.providers.groq),
        sanity: Boolean(data.providers.sanity),
      });
      setProviderCheckedAt(new Date().toLocaleTimeString("ko-KR"));
      setStatus("Provider 상태 확인 완료");
    } else {
      setStatus(data?.error ?? "Provider 상태 확인 실패");
    }

    setProviderChecking(false);
    setActiveAction(null);
    if (data?.providers) {
      setLastAction("Provider 상태 확인 완료 ✓");
    }
  }

  async function runKnowledge(count: 1 | 2) {
    const action = count === 1 ? "knowledge-one" : "knowledge-two";
    setActiveAction(action);
    setLastAction(
      count === 1
        ? "Knowledge 1건 테스트 버튼을 눌렀습니다."
        : "Knowledge 오늘 2건 버튼을 눌렀습니다.",
    );
    setStatus("Knowledge 명령 접수 중...");

    const data = await callJarvis({
      text: "자비스, Knowledge 진행해",
      count,
    });

    setActiveAction(null);

    if (data?.command_id) {
      setLastAction(
        count === 1
          ? "Knowledge 1건 명령 접수 완료 ✓"
          : "Knowledge 2건 명령 접수 완료 ✓",
      );
      void pollCommand(data.command_id);
    }
  }

  async function checkKnowledgeStatus() {
    setActiveAction("knowledge-status");
    setLastAction("Knowledge 상태 확인 버튼을 눌렀습니다.");
    setStatus("현재 Knowledge 상태 확인 중...");
    const data = await callJarvis({ action: "knowledge_status" }, true);
    setActiveAction(null);
    if (data?.knowledge_job) {
      setLastAction("Knowledge 상태 확인 완료 ✓");
      setStatus("Knowledge 상태 확인 완료");
    } else {
      setStatus(data?.error ?? "현재 Knowledge 작업을 찾지 못했습니다.");
    }
  }

  async function checkTodayStatus() {
    setActiveAction("today");
    setLastAction("오늘 상태 버튼을 눌렀습니다.");
    const data = await callJarvis({ text: "자비스, 오늘 어떻게 됐어?" });
    setActiveAction(null);
    if (data?.ok) {
      setLastAction("오늘 상태 조회 완료 ✓");
    }
  }

  async function sendFreeCommand() {
    const text = commandText.trim();
    if (!text) return;
    setActiveAction("free-command");
    setLastAction("자비스에게 명령을 전달했습니다.");
    const data = await callJarvis({ text });
    setActiveAction(null);
    if (data?.intent === "knowledge_run" && data.command_id) {
      setLastAction("Knowledge 명령 접수 완료 ✓");
      void pollCommand(data.command_id);
    } else if (data?.ok) {
      setLastAction("명령 전달 완료 ✓");
    }
  }

  async function approveKnowledge(jobId: string) {
    if (!activeCommandId) return;
    const data = await callJarvis({ action: "approve_knowledge", jobId });
    if (data?.ok) {
      setLastAction("Knowledge 사람 검증 승인 완료 ✓");
      setStatus("승인 완료. 실제 발행 확인 중...");
      void pollCommand(activeCommandId);
    }
  }

  function savePair() {
    setActiveAction("pair");
    window.localStorage.setItem("jarvis_device_key", deviceKey.trim());
    window.localStorage.setItem("jarvis_device_token", deviceToken.trim());
    setPairSaved(true);
    setStatus("이 iPhone에 pairing 정보 저장 완료");
    setLastAction("기기 연결 정보 저장 완료 ✓");
    setActiveAction(null);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0c0e",
        color: "#f3f4f6",
        padding: "24px 16px 48px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, margin: "8px 0 4px" }}>JARVIS Remote</h1>
        <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 0 }}>
          iPhone → DECHIVE Cloud Control Plane
        </p>

        <section
          style={{
            ...card,
            padding: 12,
            borderColor: activeAction ? "#5f6f86" : "#272a2f",
            background: activeAction ? "#141d28" : "#111317",
          }}
        >
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            최근 동작
          </div>
          <div style={{ marginTop: 5, fontWeight: 700 }}>
            {activeAction
              ? "처리 중..."
              : lastAction ?? "아직 누른 버튼이 없습니다."}
          </div>
        </section>

        {knowledgeJob ? (() => {
          const state = humanKnowledgeState(knowledgeJob);
          const details = knowledgeJob.result ?? {};
          const title =
            details.review_title ??
            details.title ??
            details.draft?.title ??
            knowledgeJob.source_code ??
            "Knowledge";
          const score = details.verification?.score;
          const publicUrl = knowledgeJob.result_url || knowledgeJob.published_url;

          return (
            <section
              style={{
                ...card,
                background: state.background,
                borderColor: state.border,
              }}
            >
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                현재 Knowledge 상태
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 20,
                  fontWeight: 850,
                  color: state.color,
                }}
              >
                {state.title}
              </div>
              <div style={{ marginTop: 10, fontWeight: 750 }}>{title}</div>
              <div
                style={{
                  marginTop: 7,
                  color: "#c2c7cf",
                  lineHeight: 1.55,
                }}
              >
                {state.detail}
              </div>
              {typeof score === "number" ? (
                <div style={{ marginTop: 10 }}>
                  최근 검증 점수: <strong>{score}</strong>
                </div>
              ) : null}
              {publicUrl ? (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: 12,
                    color: "#b8d8ff",
                    fontWeight: 700,
                  }}
                >
                  실제 발행 페이지 열기 →
                </a>
              ) : (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    borderRadius: 10,
                    background: "rgba(0,0,0,0.18)",
                    fontWeight: 700,
                  }}
                >
                  공개 URL 없음 — 아직 발행되지 않았습니다.
                </div>
              )}
              <button
                onClick={() => void checkKnowledgeStatus()}
                disabled={activeAction === "knowledge-status"}
                style={{
                  ...secondaryButton,
                  marginTop: 12,
                  opacity: activeAction === "knowledge-status" ? 0.65 : 1,
                }}
              >
                {activeAction === "knowledge-status"
                  ? "상태 확인 중..."
                  : "현재 상태 새로고침"}
              </button>
            </section>
          );
        })() : null}

        <section style={card}>
          <strong>기기 연결</strong>
          <label style={{ display: "block", margin: "12px 0 6px" }}>
            Device Key
          </label>
          <input
            value={deviceKey}
            onChange={(event) => { setDeviceKey(event.target.value); setPairSaved(false); }}
            placeholder="iphone-primary"
            style={inputStyle}
          />
          <label style={{ display: "block", margin: "12px 0 6px" }}>
            Device Token
          </label>
          <input
            value={deviceToken}
            onChange={(event) => { setDeviceToken(event.target.value); setPairSaved(false); }}
            type="password"
            placeholder="pairing token"
            style={inputStyle}
          />
          <button
            onClick={savePair}
            style={{
              ...secondaryButton,
              marginTop: 10,
              background: pairSaved ? "#17351f" : secondaryButton.background,
              borderColor: pairSaved ? "#2f7a45" : secondaryButton.border,
            }}
          >
            {activeAction === "pair"
              ? "저장 중..."
              : pairSaved
                ? "저장됨 ✓"
                : "이 기기에 저장"}
          </button>
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: pairSaved ? "#8bd49c" : "#9ca3af",
            }}
          >
            {pairSaved
              ? "이 iPhone이 JARVIS Remote에 연결되었습니다."
              : "Device Key와 Token을 저장하면 이곳에 연결 상태가 표시됩니다."}
          </div>
        </section>

        <section style={card}>
          <strong>빠른 명령</strong>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 12,
            }}
          >
            <button
              onClick={() => void runKnowledge(1)}
              disabled={
                activeAction === "knowledge-one" || Boolean(activeCommandId)
              }
              style={{
                ...buttonStyle,
                boxShadow:
                  providerState?.groq && providerState?.sanity
                    ? "0 0 0 2px rgba(139,212,156,0.35)"
                    : "none",
                opacity:
                  activeAction === "knowledge-one" || activeCommandId
                    ? 0.65
                    : 1,
              }}
            >
              {activeAction === "knowledge-one"
                ? "명령 접수 중..."
                : activeCommandId
                  ? "Knowledge 작업 진행 중 ✓"
                  : "Knowledge 1건 테스트"}
            </button>
            <button
              onClick={() => void runKnowledge(2)}
              disabled={
                activeAction === "knowledge-two" || Boolean(activeCommandId)
              }
              style={{
                ...buttonStyle,
                opacity:
                  activeAction === "knowledge-two" || activeCommandId
                    ? 0.65
                    : 1,
              }}
            >
              {activeAction === "knowledge-two"
                ? "명령 접수 중..."
                : activeCommandId
                  ? "Knowledge 작업 진행 중 ✓"
                  : "Knowledge 오늘 2건"}
            </button>
            <button
              onClick={() => void checkKnowledgeStatus()}
              disabled={activeAction === "knowledge-status"}
              style={{
                ...buttonStyle,
                opacity: activeAction === "knowledge-status" ? 0.65 : 1,
              }}
            >
              {activeAction === "knowledge-status"
                ? "확인 중..."
                : "Knowledge 상태 확인"}
            </button>
            <button
              onClick={() => void checkTodayStatus()}
              disabled={activeAction === "today"}
              style={{
                ...buttonStyle,
                opacity: activeAction === "today" ? 0.65 : 1,
              }}
            >
              {activeAction === "today" ? "조회 중..." : "오늘 상태"}
            </button>
            <button
              onClick={() => void checkProviderStatus()}
              disabled={providerChecking}
              style={{
                ...secondaryButton,
                opacity: providerChecking ? 0.65 : 1,
              }}
            >
              {providerChecking ? "확인 중..." : "Provider 상태 확인"}
            </button>
          </div>
        </section>

        <section
          style={{
            ...card,
            borderColor:
              providerState?.groq && providerState?.sanity
                ? "#2f7a45"
                : providerState
                  ? "#7a3b3b"
                  : "#272a2f",
            background:
              providerState?.groq && providerState?.sanity
                ? "#102417"
                : "#14161a",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>
            {providerState === null
              ? "Provider 연결 상태"
              : providerState.groq && providerState.sanity
                ? "✅ Provider 연결 완료"
                : providerState.groq || providerState.sanity
                  ? "⚠️ Provider 1/2 연결됨"
                  : "❌ Provider 미연결"}
          </div>
          <div
            style={{
              marginTop: 6,
              color:
                providerState?.groq && providerState?.sanity
                  ? "#8bd49c"
                  : "#b9bec7",
              fontSize: 14,
            }}
          >
            {providerState === null
              ? "아직 상태를 확인하지 않았습니다."
              : providerState.groq && providerState.sanity
                ? "Groq · Sanity 모두 연결됨"
                : providerState.groq
                  ? "Groq만 연결됨"
                  : providerState.sanity
                    ? "Sanity만 연결됨"
                    : "Groq와 Sanity를 연결하세요"}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 12,
            }}
          >
            <div
              style={{
                border: "1px solid #30343a",
                borderRadius: 12,
                padding: 12,
                background: "#0f1114",
              }}
            >
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Groq</div>
              <div
                style={{
                  marginTop: 6,
                  fontWeight: 700,
                  color:
                    providerState === null
                      ? "#9ca3af"
                      : providerState.groq
                        ? "#8bd49c"
                        : "#ff8f8f",
                }}
              >
                {providerState === null
                  ? "확인 전"
                  : providerState.groq
                    ? "연결됨 ✓"
                    : "미연결"}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #30343a",
                borderRadius: 12,
                padding: 12,
                background: "#0f1114",
              }}
            >
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Sanity</div>
              <div
                style={{
                  marginTop: 6,
                  fontWeight: 700,
                  color:
                    providerState === null
                      ? "#9ca3af"
                      : providerState.sanity
                        ? "#8bd49c"
                        : "#ff8f8f",
                }}
              >
                {providerState === null
                  ? "확인 전"
                  : providerState.sanity
                    ? "연결됨 ✓"
                    : "미연결"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10, color: "#9ca3af", fontSize: 13 }}>
            {providerChecking
              ? "JARVIS Cloud에서 현재 Provider 상태를 확인하고 있습니다..."
              : providerCheckedAt
                ? "마지막 확인: " + providerCheckedAt
                : "아직 상태를 조회하지 않았습니다."}
          </div>

          {providerState?.groq && providerState?.sanity ? (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                background: "#17351f",
                border: "1px solid #2f7a45",
                color: "#b7efc4",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              이제 Knowledge 1건 테스트를 실행할 수 있습니다.
            </div>
          ) : null}

          <button
            onClick={() => void checkProviderStatus()}
            disabled={providerChecking}
            style={{
              ...secondaryButton,
              marginTop: 10,
              opacity: providerChecking ? 0.65 : 1,
            }}
          >
            {providerChecking ? "확인 중..." : "지금 다시 확인"}
          </button>
        </section>

        <section style={card}>
          <strong>자비스에게 말하기</strong>
          <textarea
            value={commandText}
            onChange={(event) => setCommandText(event.target.value)}
            placeholder="예: 자비스, Knowledge 진행해"
            style={{ ...inputStyle, minHeight: 96, marginTop: 12 }}
          />
          <button
            onClick={() => void sendFreeCommand()}
            disabled={activeAction === "free-command"}
            style={{ ...buttonStyle, marginTop: 10 }}
          >
            {activeAction === "free-command" ? "전달 중..." : "진행해"}
          </button>
        </section>

        <section style={card}>
          <strong>Cloud Provider 연결</strong>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>
            키는 JARVIS Cloud Vault로 전달하고 이 화면에는 남기지 않습니다.
          </p>
          <label style={{ display: "block", margin: "12px 0 6px" }}>
            Groq API Key
          </label>
          <input
            value={groqKey}
            onChange={(event) => setGroqKey(event.target.value)}
            type="password"
            placeholder="gsk_..."
            style={inputStyle}
          />
          <button
            onClick={async () => {
              if (!groqKey.trim()) return;
              setActiveAction("groq-save");
              setLastAction("Groq 연결 버튼을 눌렀습니다.");
              const data = await callJarvis({
                action: "set_provider_secret",
                provider: "groq",
                secret: groqKey.trim(),
              });
              setActiveAction(null);
              if (data?.ok) {
                setGroqKey("");
                setStatus("Groq 연결 저장 완료 — 상태를 다시 확인합니다.");
                setLastAction("Groq 연결 저장 완료 ✓");
                void checkProviderStatus();
              }
            }}
            style={{ ...secondaryButton, marginTop: 10 }}
          >
            {activeAction === "groq-save" ? "연결 중..." : "Groq 연결"}
          </button>

          <label style={{ display: "block", margin: "16px 0 6px" }}>
            Sanity Write Token
          </label>
          <input
            value={sanityKey}
            onChange={(event) => setSanityKey(event.target.value)}
            type="password"
            placeholder="Sanity API token"
            style={inputStyle}
          />
          <button
            onClick={async () => {
              if (!sanityKey.trim()) return;
              setActiveAction("sanity-save");
              setLastAction("Sanity 연결 버튼을 눌렀습니다.");
              const data = await callJarvis({
                action: "set_provider_secret",
                provider: "sanity",
                secret: sanityKey.trim(),
              });
              setActiveAction(null);
              if (data?.ok) {
                setSanityKey("");
                setStatus("Sanity 연결 저장 완료 — 상태를 다시 확인합니다.");
                setLastAction("Sanity 연결 저장 완료 ✓");
                void checkProviderStatus();
              }
            }}
            style={{ ...secondaryButton, marginTop: 10 }}
          >
            {activeAction === "sanity-save" ? "연결 중..." : "Sanity 연결"}
          </button>
        </section>

        {approvalJobs.length > 0 ? (
          <section style={card}>
            <strong>사람 검증이 필요합니다</strong>
            {approvalJobs.map((job) => {
              const details = job.result ?? {};
              const draft = details.draft ?? {};
              const title =
                details.review_title ??
                details.title ??
                draft.title ??
                job.source_code ??
                "Knowledge";
              const summary =
                details.review_summary ?? details.summary ?? draft.summary ?? "";
              const sources = details.sources ?? [];

              return (
                <article
                  key={job.job_id ?? title}
                  style={{
                    borderTop: "1px solid #2b2f35",
                    paddingTop: 14,
                    marginTop: 14,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
                  <p style={{ color: "#b9bec7", lineHeight: 1.55 }}>{summary}</p>
                  <div>
                    JARVIS 검증 점수 {details.verification?.score ?? "-"}
                  </div>
                  <details style={{ marginTop: 12 }}>
                    <summary style={{ cursor: "pointer" }}>글 전체 보기</summary>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        background: "#0d0f12",
                        padding: 12,
                        borderRadius: 12,
                        maxHeight: 420,
                        overflow: "auto",
                      }}
                    >
                      {draft.body_markdown ?? ""}
                    </pre>
                  </details>
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ cursor: "pointer" }}>
                      검증 출처 보기 ({sources.length})
                    </summary>
                    <ul>
                      {sources.map((source, index) =>
                        source.url ? (
                          <li
                            key={source.url + index}
                            style={{ margin: "6px 0" }}
                          >
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#b8d8ff" }}
                            >
                              {source.title || source.url}
                            </a>
                          </li>
                        ) : null,
                      )}
                    </ul>
                  </details>
                  {job.job_id ? (
                    <button
                      onClick={() => void approveKnowledge(job.job_id!)}
                      style={{ ...buttonStyle, marginTop: 12 }}
                    >
                      내용·출처 확인 완료 — 승인 & 발행
                    </button>
                  ) : null}
                </article>
              );
            })}
          </section>
        ) : null}

        <section style={card}>
          <strong>JARVIS 상태</strong>
          <div style={{ color: "#b9bec7", marginTop: 10, lineHeight: 1.5 }}>
            {status}
          </div>
          <details style={{ marginTop: 12 }}>
            <summary
              style={{
                cursor: "pointer",
                color: "#777f8b",
                fontSize: 13,
              }}
            >
              개발자 상세 보기
            </summary>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                background: "#0d0f12",
                padding: 12,
                borderRadius: 12,
                maxHeight: 380,
                overflow: "auto",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {JSON.stringify(result ?? {}, null, 2)}
            </pre>
          </details>
        </section>
      </div>
    </main>
  );
}
