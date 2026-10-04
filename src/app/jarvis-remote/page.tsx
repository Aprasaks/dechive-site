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

  const approvalJobs = useMemo(() => {
    const jobs = result?.command?.result?.jobs ?? [];
    return jobs.filter(
      (job) =>
        job.status === "waiting_for_user" &&
        Boolean(job.result?.sanity_document_id),
    );
  }, [result]);

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
      if (!command) continue;

      if (command.status === "waiting_for_user") {
        setStatus("사람 검증이 필요합니다.");
        return;
      }
      if (command.status === "done") {
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
  }

  async function runKnowledge(count: 1 | 2) {
    const data = await callJarvis({
      text: "자비스, Knowledge 진행해",
      count,
    });
    if (data?.command_id) void pollCommand(data.command_id);
  }

  async function approveKnowledge(jobId: string) {
    if (!activeCommandId) return;
    const data = await callJarvis({ action: "approve_knowledge", jobId });
    if (data?.ok) {
      setStatus("승인 완료. 실제 발행 확인 중...");
      void pollCommand(activeCommandId);
    }
  }

  function savePair() {
    window.localStorage.setItem("jarvis_device_key", deviceKey.trim());
    window.localStorage.setItem("jarvis_device_token", deviceToken.trim());
    setPairSaved(true);
    setStatus("이 iPhone에 pairing 정보 저장 완료");
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
            {pairSaved ? "저장됨 ✓" : "이 기기에 저장"}
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
            <button onClick={() => void runKnowledge(1)} style={buttonStyle}>
              Knowledge 1건 테스트
            </button>
            <button onClick={() => void runKnowledge(2)} style={buttonStyle}>
              Knowledge 오늘 2건
            </button>
            <button
              onClick={() =>
                void callJarvis({ text: "자비스, 오늘 어떻게 됐어?" })
              }
              style={buttonStyle}
            >
              오늘 상태
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

        <section style={card}>
          <strong>Provider 연결 상태</strong>
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
            onClick={async () => {
              const text = commandText.trim();
              if (!text) return;
              const data = await callJarvis({ text });
              if (data?.intent === "knowledge_run" && data.command_id) {
                void pollCommand(data.command_id);
              }
            }}
            style={{ ...buttonStyle, marginTop: 10 }}
          >
            진행해
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
              const data = await callJarvis({
                action: "set_provider_secret",
                provider: "groq",
                secret: groqKey.trim(),
              });
              if (data?.ok) {
                setGroqKey("");
                setStatus("Groq 연결 저장 완료 — 상태를 다시 확인합니다.");
                void checkProviderStatus();
              }
            }}
            style={{ ...secondaryButton, marginTop: 10 }}
          >
            Groq 연결
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
              const data = await callJarvis({
                action: "set_provider_secret",
                provider: "sanity",
                secret: sanityKey.trim(),
              });
              if (data?.ok) {
                setSanityKey("");
                setStatus("Sanity 연결 저장 완료 — 상태를 다시 확인합니다.");
                void checkProviderStatus();
              }
            }}
            style={{ ...secondaryButton, marginTop: 10 }}
          >
            Sanity 연결
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
          <strong>결과</strong>
          <div style={{ color: "#9ca3af", marginTop: 10 }}>{status}</div>
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
        </section>
      </div>
    </main>
  );
}
