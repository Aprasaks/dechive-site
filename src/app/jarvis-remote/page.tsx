"use client";

import { useEffect, useMemo, useState } from "react";

const COMMAND_URL =
  "https://pexoeftnkbcowauxhopf.supabase.co/functions/v1/jarvis-command";

type SourceItem = { url?: string; title?: string };
type ActivityEvent = {
  event_type?: string;
  severity?: string;
  occurred_at?: string;
};

type JobResult = {
  sanity_document_id?: string;
  sanity_slug?: string;
  review_title?: string;
  title?: string;
  review_summary?: string;
  summary?: string;
  draft?: {
    title?: string;
    summary?: string;
    body_markdown?: string;
  };
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
  started_at?: string | null;
  scheduled_at?: string | null;
  updated_at?: string | null;
  finished_at?: string | null;
  recent_activity?: ActivityEvent[];
};
type CommandView = {
  status?: string;
  result?: { jobs?: JobView[] };
};
type JarvisResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  intent?: string;
  command_id?: string;
  command?: CommandView;
  knowledge_job?: JobView | null;
  providers?: { groq?: boolean; sanity?: boolean };
};

const shell = {
  minHeight: "100vh",
  background: "#0b0c0e",
  color: "#f3f4f6",
  padding: "20px 14px 48px",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
} as const;

const card = {
  border: "1px solid #282c31",
  background: "#14161a",
  borderRadius: 20,
  padding: 16,
  marginTop: 14,
} as const;

const primary = {
  width: "100%",
  minHeight: 52,
  border: 0,
  borderRadius: 14,
  padding: "14px 16px",
  fontSize: 16,
  fontWeight: 800,
  background: "#f3f4f6",
  color: "#101113",
  cursor: "pointer",
} as const;

const secondary = {
  ...primary,
  background: "#20242a",
  color: "#f3f4f6",
  border: "1px solid #343941",
} as const;

const input = {
  width: "100%",
  border: "1px solid #343941",
  background: "#0e1013",
  color: "#fff",
  borderRadius: 12,
  padding: 13,
  fontSize: 16,
} as const;

function getHumanState(job: JobView | null) {
  if (!job) {
    return {
      tone: "idle",
      title: "준비됨",
      detail: "Knowledge 1건을 시작할 수 있습니다.",
      action: "start",
    };
  }

  const status = job.status ?? "";
  const url = job.result_url || job.published_url;

  if (status === "done" && url) {
    return {
      tone: "success",
      title: "발행 완료",
      detail: "DECHIVE 공개와 실제 페이지 확인까지 끝났습니다.",
      action: "done",
    };
  }

  if (status === "done") {
    return {
      tone: "waiting",
      title: "발행 결과 확인 필요",
      detail: "작업은 완료됐지만 공개 페이지 주소를 아직 확인하지 못했습니다.",
      action: "wait",
    };
  }

  if (status === "cancelled") {
    return {
      tone: "idle",
      title: "작업 중지됨",
      detail: "진행 중이던 Knowledge 작업을 중지했습니다. 새 작업을 시작할 수 있습니다.",
      action: "start",
    };
  }

  if (status === "waiting_for_user" && job.result?.sanity_document_id) {
    return {
      tone: "review",
      title: "검토 후 승인 필요",
      detail: "글과 출처를 확인한 뒤 승인하면 실제 발행됩니다.",
      action: "approve",
    };
  }

  if (status === "waiting_for_user") {
    return {
      tone: "error",
      title: "확인이 필요한 문제",
      detail: job.last_error || "자동 처리를 계속하기 전에 확인이 필요합니다.",
      action: "retry",
    };
  }

  if (status === "failed" || status === "rejected") {
    return {
      tone: "error",
      title: "발행 안 됨",
      detail: job.last_error || "작업이 실패했습니다.",
      action: "retry",
    };
  }

  if (status === "retry_wait" || status === "waiting_for_provider") {
    return {
      tone: "waiting",
      title: "자동 재시도 대기",
      detail: "잠시 기다리면 JARVIS가 다시 시도합니다. 아직 발행되지 않았습니다.",
      action: "wait",
    };
  }

  if (status === "publishing" || status === "post_verify") {
    return {
      tone: "working",
      title: "발행 처리 중",
      detail: "승인은 끝났습니다. 실제 DECHIVE 페이지까지 확인하고 있습니다.",
      action: "working",
    };
  }

  if (status === "waiting_for_capability") {
    return {
      tone: "working",
      title: "Sanity 저장 중",
      detail: "검증은 끝났고 Sanity review 문서를 만드는 중입니다.",
      action: "working",
    };
  }

  if (status === "verifying") {
    return {
      tone: "working",
      title: "사실 검증 중",
      detail: "작성한 글과 출처를 다시 확인하고 있습니다.",
      action: "working",
    };
  }

  if (status === "generating") {
    return {
      tone: "working",
      title: "글 작성 중",
      detail: "조사 결과를 바탕으로 Knowledge 원고를 작성하고 있습니다.",
      action: "working",
    };
  }

  if (status === "researching") {
    return {
      tone: "working",
      title: "자료 조사 중",
      detail: "공식 자료와 근거를 조사하고 있습니다.",
      action: "working",
    };
  }

  return {
    tone: "working",
    title: "작업 진행 중",
    detail: "JARVIS가 Knowledge 작업을 처리하고 있습니다.",
    action: "working",
  };
}

function toneStyle(tone: string) {
  if (tone === "success") {
    return { background: "#102417", border: "#2f7a45", color: "#91dda3" };
  }
  if (tone === "review") {
    return { background: "#2a1d10", border: "#875322", color: "#f2b66d" };
  }
  if (tone === "error") {
    return { background: "#2b1515", border: "#7c3131", color: "#ff9292" };
  }
  if (tone === "waiting") {
    return { background: "#292313", border: "#77632f", color: "#efd276" };
  }
  if (tone === "working") {
    return { background: "#121d2a", border: "#31557b", color: "#a5c9ff" };
  }
  return { background: "#15171b", border: "#343941", color: "#f3f4f6" };
}

type PipelineState = "done" | "active" | "waiting" | "error" | "pending";

type PipelineStep = {
  label: string;
  detail: string;
  state: PipelineState;
};

function formatTimestamp(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function activityStage(eventType?: string) {
  if (!eventType) return null;
  if (eventType === "job.researching") return 0;
  if (eventType === "job.generating") return 1;
  if (eventType === "job.verifying") return 2;
  if (
    eventType === "job.waiting_for_capability" ||
    eventType === "job.capability_stage_claimed"
  ) return 3;
  if (
    eventType === "job.waiting_for_user" ||
    eventType === "knowledge.human_approved"
  ) return 4;
  if (eventType === "job.post_verify") return 5;
  if (eventType === "job.done") return 6;
  return null;
}

function activityLabel(eventType?: string) {
  const labels: Record<string, string> = {
    "job.claimed.v2": "JARVIS가 작업을 가져왔습니다.",
    "job.researching": "자료 조사 시작",
    "job.generating": "원고 작성 시작",
    "job.verifying": "사실 검증 시작",
    "job.provider_retry": "Provider 응답 문제 — 자동 재시도 대기",
    "job.retry_wait": "자동 재시도 대기",
    "job.waiting_for_provider": "Provider 응답 대기",
    "job.waiting_for_capability": "다음 처리 단계 대기",
    "job.capability_stage_claimed": "다음 처리 Worker가 작업을 가져왔습니다.",
    "job.waiting_for_user": "사용자 확인 필요",
    "knowledge.human_approved": "사용자 승인 완료",
    "job.post_verify": "공개 페이지 확인 중",
    "job.done": "발행과 공개 확인 완료",
    "job.cancelled": "사용자가 작업을 중지했습니다.",
  };
  return labels[eventType ?? ""] ?? "작업 상태가 갱신되었습니다.";
}

function formatClock(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatElapsed(milliseconds: number) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  const hours = Math.floor(minutes / 60);
  const minutePart = minutes % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutePart).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getPipelineSteps(job: JobView | null): PipelineStep[] {
  if (!job) {
    return [
      { label: "자료 조사", detail: "아직 시작하지 않음", state: "pending" },
      { label: "원고 작성", detail: "대기", state: "pending" },
      { label: "사실 검증", detail: "대기", state: "pending" },
      { label: "Sanity 저장", detail: "대기", state: "pending" },
      { label: "사용자 승인", detail: "대기", state: "pending" },
      { label: "실제 발행", detail: "대기", state: "pending" },
    ];
  }

  const status = job.status ?? "";
  const result = job.result ?? {};
  const sources = result.sources ?? [];
  const score = result.verification?.score;
  const events = job.recent_activity ?? [];

  const statusStage: Record<string, number> = {
    researching: 0,
    generating: 1,
    verifying: 2,
    waiting_for_capability: 3,
    waiting_for_user: 4,
    publishing: 5,
    post_verify: 5,
    done: 6,
  };

  let currentStage = statusStage[status] ?? -1;

  if (status === "retry_wait" || status === "waiting_for_provider" || status === "cancelled") {
    const latestStage = events
      .map((event) => activityStage(event.event_type))
      .find((value) => value !== null);
    if (latestStage !== undefined && latestStage !== null) {
      currentStage = latestStage;
    }
  }

  const isWaiting =
    status === "retry_wait" ||
    status === "waiting_for_provider" ||
    status === "waiting_for_user" ||
    status === "cancelled";
  const isError = status === "failed" || status === "rejected";

  const labels = [
    "자료 조사",
    "원고 작성",
    "사실 검증",
    "Sanity 저장",
    "사용자 승인",
    "실제 발행",
  ];

  const defaultDetails = [
    sources.length > 0 ? `${sources.length}개 출처 확인` : "공식 자료와 근거 확인",
    "Knowledge 원고 생성",
    typeof score === "number" ? `검증 점수 ${score}` : "출처와 핵심 문장 재검증",
    result.sanity_document_id ? "review 문서 저장 완료" : "Sanity review 문서 저장",
    "사람 검토 및 승인",
    job.result_url || job.published_url ? "공개 페이지 확인 완료" : "DECHIVE 공개 확인",
  ];

  return labels.map((label, index) => {
    if (currentStage === 6 || index < currentStage) {
      return { label, detail: defaultDetails[index], state: "done" as const };
    }

    if (index === currentStage) {
      if (isError) {
        return {
          label,
          detail: job.last_error || "이 단계에서 작업이 중단됨",
          state: "error" as const,
        };
      }

      if (isWaiting) {
        return {
          label,
          detail:
            status === "cancelled"
              ? "사용자가 작업을 중지했습니다."
              : status === "waiting_for_user"
                ? "사용자 확인이 필요합니다."
                : "응답을 기다린 뒤 자동으로 다시 시도합니다.",
          state: "waiting" as const,
        };
      }

      return {
        label,
        detail:
          index === 0
            ? "공식 자료와 근거를 찾는 중"
            : index === 1
              ? "조사 결과를 바탕으로 원고 작성 중"
              : index === 2
                ? "출처와 핵심 문장을 다시 확인 중"
                : index === 3
                  ? "Sanity review 문서를 저장 중"
                  : index === 4
                    ? "사용자 확인을 기다리는 중"
                    : "공개 페이지를 확인하는 중",
        state: "active" as const,
      };
    }

    return { label, detail: "대기", state: "pending" as const };
  });
}

function pipelineStateMeta(state: PipelineState) {
  if (state === "done") {
    return { icon: "✓", label: "완료", color: "#91dda3", background: "#102417" };
  }
  if (state === "active") {
    return { icon: "●", label: "진행 중", color: "#a5c9ff", background: "#121d2a" };
  }
  if (state === "waiting") {
    return { icon: "!", label: "확인 필요", color: "#efd276", background: "#292313" };
  }
  if (state === "error") {
    return { icon: "×", label: "문제", color: "#ff9292", background: "#2b1515" };
  }
  return { icon: "○", label: "대기", color: "#838b96", background: "#101215" };
}

export default function JarvisRemotePage() {
  const [deviceKey, setDeviceKey] = useState("");
  const [deviceToken, setDeviceToken] = useState("");
  const [pairSaved, setPairSaved] = useState(false);

  const [providerState, setProviderState] = useState<{
    groq: boolean;
    sanity: boolean;
  } | null>(null);
  const [providerChecking, setProviderChecking] = useState(false);
  const [providerCheckedAt, setProviderCheckedAt] = useState<string | null>(null);
  const [knowledgeCheckedAt, setKnowledgeCheckedAt] = useState<string | null>(null);
  const [todayCheckedAt, setTodayCheckedAt] = useState<string | null>(null);

  const [knowledgeJob, setKnowledgeJob] = useState<JobView | null>(null);
  const [activeCommandId, setActiveCommandId] = useState<string | null>(null);

  const [statusText, setStatusText] = useState("대기 중");
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<JarvisResponse | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [commandText, setCommandText] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [sanityKey, setSanityKey] = useState("");

  useEffect(() => {
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const dk = window.localStorage.getItem("jarvis_device_key") ?? "";
      const dt = window.localStorage.getItem("jarvis_device_token") ?? "";

      setDeviceKey(dk);
      setDeviceToken(dt);
      setPairSaved(Boolean(dk && dt));

      if (dk && dt) {
        void bootstrap(dk, dt);
      }
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function request(
    body: Record<string, unknown>,
    creds?: { key: string; token: string },
    quiet = false,
  ): Promise<JarvisResponse | null> {
    const key = creds?.key ?? deviceKey.trim();
    const token = creds?.token ?? deviceToken.trim();

    if (!key || !token) {
      if (!quiet) setStatusText("먼저 기기 연결 정보를 저장하세요.");
      return null;
    }

    try {
      const response = await fetch(COMMAND_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-jarvis-device": key,
          "x-jarvis-token": token,
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json().catch(() => ({}))) as JarvisResponse;
      setResult(data);

      if (data.knowledge_job) setKnowledgeJob(data.knowledge_job);

      const jobs = data.command?.result?.jobs ?? [];
      const knowledge = jobs.find((job) => Boolean(job.source_code));
      if (knowledge) setKnowledgeJob(knowledge);

      if (!response.ok && !quiet) {
        setStatusText(data.error || "요청 처리 중 오류가 발생했습니다.");
      }

      return data;
    } catch (error) {
      if (!quiet) {
        setStatusText(
          error instanceof Error ? "네트워크 오류: " + error.message : "네트워크 오류",
        );
      }
      return null;
    }
  }

  async function bootstrap(key: string, token: string) {
    setStatusText("현재 상태 불러오는 중...");
    const creds = { key, token };

    const [provider, knowledge] = await Promise.all([
      request({ action: "provider_status" }, creds, true),
      request({ action: "knowledge_status" }, creds, true),
    ]);

    if (provider?.providers) {
      setProviderState({
        groq: Boolean(provider.providers.groq),
        sanity: Boolean(provider.providers.sanity),
      });
      setProviderCheckedAt(new Date().toLocaleTimeString("ko-KR"));
    }

    if (knowledge?.knowledge_job) {
      setKnowledgeJob(knowledge.knowledge_job);
    }
    if (knowledge) {
      setKnowledgeCheckedAt(new Date().toLocaleTimeString("ko-KR"));
    }

    setStatusText("현재 상태 확인 완료");
  }

  async function refreshKnowledge(quietUi = false) {
    if (!quietUi) {
      setBusy("refresh");
      setStatusText("Knowledge 상태 확인 중...");
    }

    const data = await request({ action: "knowledge_status" }, undefined, true);

    if (!quietUi) {
      setBusy(null);
    }

    if (data?.knowledge_job) {
      setKnowledgeJob(data.knowledge_job);
      setKnowledgeCheckedAt(new Date().toLocaleTimeString("ko-KR"));
      if (!quietUi) setStatusText("Knowledge 상태 확인 완료");
    } else if (data) {
      setKnowledgeJob(null);
      setKnowledgeCheckedAt(new Date().toLocaleTimeString("ko-KR"));
      if (!quietUi) setStatusText("현재 Knowledge 작업이 없습니다.");
    } else if (!quietUi) {
      setStatusText("Knowledge 상태 확인 실패");
    }
  }

  async function checkTodayStatus() {
    setBusy("today");
    setStatusText("오늘 상태 확인 중...");

    const data = await request(
      { text: "자비스, 오늘 어떻게 됐어?" },
      undefined,
      true,
    );

    setBusy(null);

    if (data?.ok) {
      setTodayCheckedAt(new Date().toLocaleTimeString("ko-KR"));
      setStatusText(data.message || "오늘 상태 확인 완료");
    } else {
      setStatusText(data?.error || "오늘 상태 확인 실패");
    }
  }

  async function refreshProviders() {
    setProviderChecking(true);
    const data = await request({ action: "provider_status" }, undefined, true);
    setProviderChecking(false);

    if (data?.providers) {
      setProviderState({
        groq: Boolean(data.providers.groq),
        sanity: Boolean(data.providers.sanity),
      });
      setProviderCheckedAt(new Date().toLocaleTimeString("ko-KR"));
      setStatusText("Provider 상태 확인 완료");
    } else {
      setStatusText("Provider 상태 확인 실패");
    }
  }

  async function startKnowledge() {
    setBusy("start");
    setStatusText("Knowledge 1건 시작 요청 중...");

    const data = await request({
      text: "자비스, Knowledge 진행해",
      count: 1,
    });

    setBusy(null);

    if (data?.command_id) {
      setActiveCommandId(data.command_id);
      setStatusText("Knowledge 작업 시작됨");
      void pollCommand(data.command_id);
    }
  }

  async function pollCommand(commandId: string) {
    setActiveCommandId(commandId);

    for (let index = 0; index < 120; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const commandData = await request(
        { action: "command_status", commandId },
        undefined,
        true,
      );

      if (index % 2 === 0) {
        await refreshKnowledge(true);
      }

      const command = commandData?.command;
      if (!command) continue;

      if (
        command.status === "waiting_for_user" ||
        command.status === "done" ||
        command.status === "failed" ||
        command.status === "cancelled"
      ) {
        await refreshKnowledge(true);
        setActiveCommandId(null);
        return;
      }
    }
  }

  useEffect(() => {
    const liveStatuses = new Set([
      "claimed",
      "researching",
      "generating",
      "verifying",
      "waiting_for_capability",
      "publishing",
      "post_verify",
      "retry_wait",
      "waiting_for_provider",
    ]);

    if (!pairSaved || !knowledgeJob?.status || !liveStatuses.has(knowledgeJob.status)) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshKnowledge(true);
    }, 2000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairSaved, knowledgeJob?.job_id, knowledgeJob?.status]);

  async function approveKnowledge(jobId: string) {
    setBusy("approve");
    setStatusText("승인 전달 중...");

    const data = await request({
      action: "approve_knowledge",
      jobId,
    });

    if (data?.ok) {
      setStatusText("승인 완료. 실제 발행 확인 중...");
      setBusy(null);

      if (activeCommandId) {
        void pollCommand(activeCommandId);
      } else {
        for (let index = 0; index < 24; index += 1) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          const latest = await request(
            { action: "knowledge_status" },
            undefined,
            true,
          );
          if (latest?.knowledge_job) {
            setKnowledgeJob(latest.knowledge_job);
            if (
              latest.knowledge_job.status === "done" ||
              latest.knowledge_job.status === "waiting_for_user"
            ) {
              break;
            }
          }
        }
      }
    } else {
      setBusy(null);
      setStatusText(data?.error || "승인 처리 실패");
    }
  }

  async function retryKnowledge(jobId?: string) {
    if (!jobId) return;
    setBusy("retry");
    setStatusText("다시 실행 요청 중...");

    const data = await request({ action: "run_job", jobId });
    setBusy(null);

    if (data?.ok) {
      setStatusText("다시 실행 시작됨");
      void refreshKnowledge();
    } else {
      setStatusText(data?.error || "다시 실행 실패");
    }
  }

  function savePair() {
    const key = deviceKey.trim();
    const token = deviceToken.trim();

    if (!key || !token) {
      setStatusText("Device Key와 Token을 모두 입력하세요.");
      return;
    }

    window.localStorage.setItem("jarvis_device_key", key);
    window.localStorage.setItem("jarvis_device_token", token);
    setPairSaved(true);
    setStatusText("이 iPhone 연결 정보 저장 완료");
    void bootstrap(key, token);
  }

  async function sendFreeCommand() {
    const text = commandText.trim();
    if (!text) return;

    setBusy("command");
    setStatusText("명령 전달 중...");
    const data = await request({ text });
    setBusy(null);

    if (data?.intent === "knowledge_run" && data.command_id) {
      setActiveCommandId(data.command_id);
      setStatusText("Knowledge 명령 접수 완료");
      void pollCommand(data.command_id);
    } else if (data?.ok) {
      setStatusText("명령 전달 완료");
    }
  }

  const state = useMemo(() => getHumanState(knowledgeJob), [knowledgeJob]);
  const tone = toneStyle(state.tone);

  const details = knowledgeJob?.result ?? {};
  const draft = details.draft ?? {};
  const title =
    details.review_title ??
    details.title ??
    draft.title ??
    knowledgeJob?.source_code ??
    "Knowledge";

  const summary =
    details.review_summary ?? details.summary ?? draft.summary ?? "";

  const score = details.verification?.score;
  const sources = details.sources ?? [];
  const publicUrl = knowledgeJob?.result_url || knowledgeJob?.published_url;
  const pipelineSteps = useMemo(
    () => getPipelineSteps(knowledgeJob),
    [knowledgeJob],
  );
  const publishedAtLabel = formatTimestamp(knowledgeJob?.published_at);
  const liveStatuses = new Set([
    "claimed",
    "researching",
    "generating",
    "verifying",
    "waiting_for_capability",
    "publishing",
    "post_verify",
  ]);
  const waitingStatuses = new Set(["retry_wait", "waiting_for_provider"]);
  const isLive = Boolean(
    knowledgeJob?.status && liveStatuses.has(knowledgeJob.status),
  );
  const isWaitingLive = Boolean(
    knowledgeJob?.status && waitingStatuses.has(knowledgeJob.status),
  );
  const startedAtMs = knowledgeJob?.started_at
    ? new Date(knowledgeJob.started_at).getTime()
    : Number.NaN;
  const updatedAtMs = knowledgeJob?.updated_at
    ? new Date(knowledgeJob.updated_at).getTime()
    : Number.NaN;
  const scheduledAtMs = knowledgeJob?.scheduled_at
    ? new Date(knowledgeJob.scheduled_at).getTime()
    : Number.NaN;
  const elapsedLabel = Number.isNaN(startedAtMs)
    ? "00:00"
    : formatElapsed(now - startedAtMs);
  const retryCountdownLabel =
    isWaitingLive && !Number.isNaN(scheduledAtMs)
      ? formatElapsed(Math.max(0, scheduledAtMs - now))
      : null;
  const lastSignalSeconds = Number.isNaN(updatedAtMs)
    ? null
    : Math.max(0, Math.floor((now - updatedAtMs) / 1000));
  const recentActivity = knowledgeJob?.recent_activity ?? [];

  const providersReady = Boolean(
    providerState?.groq && providerState?.sanity,
  );

  return (
    <main style={shell}>
      <style>{`
        @keyframes jarvisPulse {
          0%, 100% { opacity: 0.45; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes jarvisSweep {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(260%); }
        }
        @keyframes jarvisGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(165, 201, 255, 0); }
          50% { box-shadow: 0 0 22px rgba(165, 201, 255, 0.13); }
        }
        .jarvis-live-dot {
          animation: jarvisPulse 1.25s ease-in-out infinite;
        }
        .jarvis-live-card {
          animation: jarvisGlow 2.2s ease-in-out infinite;
        }
        .jarvis-sweep {
          animation: jarvisSweep 1.8s linear infinite;
        }
      `}</style>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            margin: "6px 2px 18px",
          }}
        >
          <div>
            <h1 style={{ fontSize: 25, margin: 0 }}>JARVIS</h1>
            <div style={{ color: "#8b929c", fontSize: 13, marginTop: 5 }}>
              DECHIVE Remote
            </div>
          </div>

          <div
            style={{
              padding: "7px 10px",
              borderRadius: 999,
              background: pairSaved ? "#15331d" : "#2a1b1b",
              color: pairSaved ? "#93dda4" : "#ff9a9a",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {pairSaved ? "iPhone 연결됨" : "기기 연결 필요"}
          </div>
        </div>

        <section
          style={{
            ...card,
            background: tone.background,
            borderColor: tone.border,
            marginTop: 0,
          }}
        >
          <div style={{ fontSize: 12, color: "#969da7", fontWeight: 700 }}>
            지금 상태
          </div>

          <div
            style={{
              marginTop: 6,
              color: tone.color,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            {state.title}
          </div>

          <div
            style={{
              marginTop: 8,
              color: "#c4c9d0",
              lineHeight: 1.55,
              fontSize: 14,
            }}
          >
            {state.detail}
          </div>

          {knowledgeJob && (isLive || isWaitingLive) ? (
            <div
              className={isLive ? "jarvis-live-card" : undefined}
              style={{
                position: "relative",
                overflow: "hidden",
                marginTop: 14,
                padding: "12px 13px",
                borderRadius: 13,
                background: isLive ? "#101c29" : "#272214",
                border: isLive ? "1px solid #31557b" : "1px solid #6d5b2c",
              }}
            >
              {isLive ? (
                <div
                  className="jarvis-sweep"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "40%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(165,201,255,0.09), transparent)",
                    pointerEvents: "none",
                  }}
                />
              ) : null}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 900,
                    color: isLive ? "#a5c9ff" : "#efd276",
                  }}
                >
                  <span
                    className={isLive ? "jarvis-live-dot" : undefined}
                    style={{
                      display: "inline-block",
                      width: 9,
                      height: 9,
                      borderRadius: 999,
                      background: isLive ? "#7eb7ff" : "#d9bd63",
                    }}
                  />
                  {isLive ? "실시간 실행 중" : "응답 대기 중"}
                </div>
                <div style={{ fontVariantNumeric: "tabular-nums", fontWeight: 900 }}>
                  {isWaitingLive && retryCountdownLabel
                    ? `재시도 ${retryCountdownLabel}`
                    : elapsedLabel}
                </div>
              </div>
              <div
                style={{
                  position: "relative",
                  marginTop: 7,
                  color: "#929aa5",
                  fontSize: 12,
                }}
              >
                {isWaitingLive && retryCountdownLabel
                  ? `다음 자동 재시도까지 ${retryCountdownLabel} · 그 전에는 다시 호출하지 않습니다.`
                  : lastSignalSeconds === null
                    ? "서버 응답 확인 중"
                    : lastSignalSeconds <= 5
                      ? `마지막 서버 신호 ${lastSignalSeconds}초 전`
                      : lastSignalSeconds <= 20
                        ? `마지막 서버 신호 ${lastSignalSeconds}초 전 · 처리 중`
                        : `마지막 서버 신호 ${lastSignalSeconds}초 전 · 지연 확인 필요`}
              </div>
            </div>
          ) : null}

          {knowledgeJob ? (
            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ fontWeight: 800, lineHeight: 1.45 }}>{title}</div>
              {typeof score === "number" ? (
                <div
                  style={{
                    display: "inline-block",
                    marginTop: 9,
                    padding: "5px 8px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.07)",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  검증 점수 {score}
                </div>
              ) : null}
            </div>
          ) : null}

          <div style={{ marginTop: 16 }}>
            {!pairSaved ? (
              <button
                style={primary}
                onClick={() =>
                  document
                    .getElementById("settings")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                기기 연결하기
              </button>
            ) : state.action === "start" ? (
              <button
                style={{
                  ...primary,
                  opacity: providersReady ? 1 : 0.55,
                }}
                disabled={!providersReady || busy === "start"}
                onClick={() => void startKnowledge()}
              >
                {busy === "start" ? "시작 중..." : "Knowledge 1건 시작"}
              </button>
            ) : state.action === "approve" && knowledgeJob?.job_id ? (
              <button
                style={{
                  ...primary,
                  background: "#f2b66d",
                  color: "#25170b",
                }}
                onClick={() => void approveKnowledge(knowledgeJob.job_id!)}
                disabled={busy === "approve"}
              >
                {busy === "approve"
                  ? "승인 처리 중..."
                  : "검토 완료 — 승인 & 발행"}
              </button>
            ) : state.action === "retry" && knowledgeJob?.job_id ? (
              <button
                style={primary}
                onClick={() => void retryKnowledge(knowledgeJob.job_id)}
                disabled={busy === "retry"}
              >
                {busy === "retry" ? "다시 실행 중..." : "다시 실행"}
              </button>
            ) : state.action === "done" && publicUrl ? (
              <div style={{ display: "grid", gap: 9 }}>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    background: "#91dda3",
                  }}
                >
                  발행된 글 보기
                </a>
                <button style={secondary} onClick={() => void startKnowledge()}>
                  다음 Knowledge 1건 시작
                </button>
              </div>
            ) : (
              <button
                style={{
                  ...secondary,
                  opacity: busy === "refresh" ? 0.6 : 1,
                }}
                disabled={busy === "refresh"}
                onClick={() => void refreshKnowledge()}
              >
                {busy === "refresh" ? "상태 확인 중..." : "현재 상태 새로고침"}
              </button>
            )}
          </div>

          {!providersReady && pairSaved ? (
            <div
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 10,
                background: "rgba(0,0,0,0.2)",
                color: "#e7c976",
                fontSize: 13,
              }}
            >
              Provider 연결 상태를 확인하거나 설정을 열어주세요.
            </div>
          ) : null}
        </section>

        <section style={card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 17 }}>작업 진행 현황</div>
            <div
              style={{
                padding: "5px 8px",
                borderRadius: 999,
                background: tone.background,
                color: tone.color,
                border: `1px solid ${tone.border}`,
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {state.title}
            </div>
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {pipelineSteps.map((step) => {
              const meta = pipelineStateMeta(step.state);

              return (
                <div
                  key={step.label}
                  className={step.state === "active" ? "jarvis-live-card" : undefined}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: "34px 1fr auto",
                    gap: 10,
                    alignItems: "center",
                    padding: "11px 12px",
                    borderRadius: 12,
                    background: step.state === "active" ? "#101821" : "#0f1114",
                    border:
                      step.state === "active"
                        ? "1px solid #31557b"
                        : "1px solid #272b30",
                  }}
                >
                  {step.state === "active" ? (
                    <div
                      className="jarvis-sweep"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "36%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(165,201,255,0.07), transparent)",
                        pointerEvents: "none",
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: meta.background,
                      color: meta.color,
                      fontWeight: 900,
                    }}
                  >
                    {meta.icon}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{step.label}</div>
                    <div
                      style={{
                        marginTop: 3,
                        color: "#9098a3",
                        fontSize: 12,
                        lineHeight: 1.4,
                      }}
                    >
                      {step.detail}
                    </div>
                  </div>

                  <div
                    style={{
                      color: meta.color,
                      fontSize: 11,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {meta.label}
                  </div>
                </div>
              );
            })}
          </div>

          {recentActivity.length > 0 ? (
            <div
              style={{
                borderTop: "1px solid #2a2e34",
                marginTop: 14,
                paddingTop: 13,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 14 }}>최근 활동</div>
                <div style={{ color: "#737b86", fontSize: 11 }}>
                  실제 JARVIS 이벤트
                </div>
              </div>
              <div style={{ display: "grid", gap: 7, marginTop: 10 }}>
                {recentActivity.slice(0, 6).map((event, index) => (
                  <div
                    key={`${event.occurred_at ?? "event"}-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "72px 1fr",
                      gap: 9,
                      alignItems: "start",
                      fontSize: 12,
                      lineHeight: 1.45,
                    }}
                  >
                    <div
                      style={{
                        color: index === 0 && isLive ? "#a5c9ff" : "#737b86",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatClock(event.occurred_at)}
                    </div>
                    <div
                      style={{
                        color: index === 0 ? "#dce2e9" : "#9aa2ac",
                        fontWeight: index === 0 ? 800 : 600,
                      }}
                    >
                      {activityLabel(event.event_type)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div
            style={{
              borderTop: "1px solid #2a2e34",
              marginTop: 14,
              paddingTop: 13,
            }}
          >
            <div style={{ color: "#858d97", fontSize: 11, fontWeight: 800 }}>
              최종 결과
            </div>
            <div style={{ marginTop: 5, fontSize: 16, fontWeight: 900 }}>
              {state.title}
            </div>
            <div
              style={{
                marginTop: 5,
                color: "#aeb4bd",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {state.detail}
            </div>
            {publishedAtLabel ? (
              <div style={{ marginTop: 7, color: "#7f8792", fontSize: 12 }}>
                발행 확인 {publishedAtLabel}
              </div>
            ) : null}
          </div>
        </section>

        <section style={card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 17 }}>연결 상태</div>
            <div
              style={{
                color: providersReady ? "#91dda3" : "#efd276",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {providerState === null
                ? "확인 전"
                : providersReady
                  ? "모두 정상"
                  : "확인 필요"}
            </div>
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {[
              { label: "Groq", ok: providerState?.groq },
              { label: "Sanity", ok: providerState?.sanity },
            ].map((provider) => {
              const checked = providerState !== null;
              const ok = checked && Boolean(provider.ok);

              return (
                <div
                  key={provider.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 13px",
                    borderRadius: 12,
                    background: "#0f1114",
                    border: "1px solid #272b30",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{provider.label}</div>
                  <div
                    style={{
                      color: !checked ? "#858d97" : ok ? "#91dda3" : "#ff9292",
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    {!checked ? "○ 확인 전" : ok ? "✓ 정상" : "× 미연결"}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            style={{ ...secondary, marginTop: 10 }}
            onClick={() => void refreshProviders()}
            disabled={providerChecking}
          >
            {providerChecking ? "연결 상태 확인 중..." : "연결 상태 다시 확인"}
          </button>

          {providerCheckedAt ? (
            <div style={{ color: "#7f8792", fontSize: 12, marginTop: 7 }}>
              마지막 확인 {providerCheckedAt}
            </div>
          ) : null}
        </section>

        {state.action === "approve" && knowledgeJob ? (
          <section style={{ ...card, borderColor: "#754a25" }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>발행 전 확인</div>
            <div style={{ color: "#aeb4bd", marginTop: 6, lineHeight: 1.55 }}>
              아래 글과 출처를 확인한 뒤 위의 <strong>승인 & 발행</strong>을
              누르세요.
            </div>

            {summary ? (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  background: "#0f1114",
                  lineHeight: 1.55,
                }}
              >
                {summary}
              </div>
            ) : null}

            <details style={{ marginTop: 12 }}>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 800,
                  padding: "10px 0",
                }}
              >
                글 전체 보기
              </summary>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  background: "#0d0f12",
                  padding: 12,
                  borderRadius: 12,
                  maxHeight: 480,
                  overflow: "auto",
                  lineHeight: 1.6,
                  fontSize: 13,
                }}
              >
                {draft.body_markdown ?? ""}
              </pre>
            </details>

            <details style={{ marginTop: 2 }}>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 800,
                  padding: "10px 0",
                }}
              >
                검증 출처 보기 ({sources.length})
              </summary>
              <ul style={{ paddingLeft: 20 }}>
                {sources.map((source, index) =>
                  source.url ? (
                    <li key={source.url + index} style={{ margin: "8px 0" }}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#b7d7ff" }}
                      >
                        {source.title || source.url}
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            </details>
          </section>
        ) : null}

        <section style={card}>
          <div style={{ fontWeight: 900, fontSize: 17 }}>빠른 확인</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 9,
              marginTop: 12,
            }}
          >
            <button
              style={{
                ...secondary,
                minHeight: 72,
                borderColor: knowledgeCheckedAt ? "#2f7a45" : "#343941",
              }}
              onClick={() => void refreshKnowledge()}
              disabled={busy === "refresh"}
            >
              <div>Knowledge 상태</div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 11,
                  color: knowledgeCheckedAt ? "#91dda3" : "#8d949e",
                  fontWeight: 700,
                }}
              >
                {busy === "refresh"
                  ? "확인 중..."
                  : knowledgeCheckedAt
                    ? `✓ 확인 완료 ${knowledgeCheckedAt}`
                    : "눌러서 확인"}
              </div>
            </button>

            <button
              style={{
                ...secondary,
                minHeight: 72,
                borderColor: todayCheckedAt ? "#2f7a45" : "#343941",
              }}
              onClick={() => void checkTodayStatus()}
              disabled={busy === "today"}
            >
              <div>오늘 상태</div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 11,
                  color: todayCheckedAt ? "#91dda3" : "#8d949e",
                  fontWeight: 700,
                }}
              >
                {busy === "today"
                  ? "확인 중..."
                  : todayCheckedAt
                    ? `✓ 확인 완료 ${todayCheckedAt}`
                    : "눌러서 확인"}
              </div>
            </button>
          </div>
        </section>

        <section style={card}>
          <details>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 17,
                padding: "2px 0",
              }}
            >
              자비스에게 직접 명령하기
            </summary>

            <textarea
              value={commandText}
              onChange={(event) => setCommandText(event.target.value)}
              placeholder="예: 자비스, Knowledge 진행해"
              style={{ ...input, minHeight: 92, marginTop: 14, resize: "vertical" }}
            />
            <button
              style={{ ...secondary, marginTop: 9 }}
              onClick={() => void sendFreeCommand()}
              disabled={busy === "command"}
            >
              {busy === "command" ? "전달 중..." : "명령 보내기"}
            </button>
          </details>
        </section>

        <section id="settings" style={card}>
          <details>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 17,
                padding: "2px 0",
              }}
            >
              설정 · 연결
            </summary>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 800 }}>기기 연결</div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: pairSaved ? "#91dda3" : "#aeb4bd",
                }}
              >
                {pairSaved
                  ? "이 iPhone의 연결 정보가 저장되어 있습니다."
                  : "Device Key와 Token을 입력하세요."}
              </div>

              <label
                style={{
                  display: "block",
                  margin: "12px 0 6px",
                  color: "#9aa1aa",
                  fontSize: 12,
                }}
              >
                Device Key
              </label>
              <input
                style={input}
                value={deviceKey}
                onChange={(event) => {
                  setDeviceKey(event.target.value);
                  setPairSaved(false);
                }}
                placeholder="iphone-primary"
              />

              <label
                style={{
                  display: "block",
                  margin: "12px 0 6px",
                  color: "#9aa1aa",
                  fontSize: 12,
                }}
              >
                Device Token
              </label>
              <input
                style={input}
                value={deviceToken}
                onChange={(event) => {
                  setDeviceToken(event.target.value);
                  setPairSaved(false);
                }}
                type="password"
                placeholder="pairing token"
              />

              <button style={{ ...secondary, marginTop: 9 }} onClick={savePair}>
                {pairSaved ? "저장됨 ✓" : "이 기기에 저장"}
              </button>
            </div>

            <div
              style={{
                borderTop: "1px solid #2a2e34",
                marginTop: 20,
                paddingTop: 18,
              }}
            >
              <div style={{ fontWeight: 800 }}>Provider 키 · 연결 상세</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 9,
                  marginTop: 10,
                }}
              >
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "#0e1013",
                    border: "1px solid #30343a",
                  }}
                >
                  <div style={{ color: "#8f96a0", fontSize: 12 }}>Groq</div>
                  <div
                    style={{
                      marginTop: 5,
                      fontWeight: 800,
                      color: providerState?.groq ? "#91dda3" : "#ff9c9c",
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
                    padding: 12,
                    borderRadius: 12,
                    background: "#0e1013",
                    border: "1px solid #30343a",
                  }}
                >
                  <div style={{ color: "#8f96a0", fontSize: 12 }}>Sanity</div>
                  <div
                    style={{
                      marginTop: 5,
                      fontWeight: 800,
                      color: providerState?.sanity ? "#91dda3" : "#ff9c9c",
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

              <button
                style={{ ...secondary, marginTop: 9 }}
                onClick={() => void refreshProviders()}
                disabled={providerChecking}
              >
                {providerChecking ? "확인 중..." : "Provider 상태 다시 확인"}
              </button>

              {providerCheckedAt ? (
                <div
                  style={{
                    color: "#858d97",
                    fontSize: 12,
                    marginTop: 7,
                  }}
                >
                  마지막 확인 {providerCheckedAt}
                </div>
              ) : null}

              <label
                style={{
                  display: "block",
                  margin: "18px 0 6px",
                  color: "#9aa1aa",
                  fontSize: 12,
                }}
              >
                Groq API Key
              </label>
              <input
                style={input}
                type="password"
                value={groqKey}
                onChange={(event) => setGroqKey(event.target.value)}
                placeholder="변경할 때만 입력"
              />
              <button
                style={{ ...secondary, marginTop: 8 }}
                onClick={async () => {
                  if (!groqKey.trim()) return;
                  setBusy("groq");
                  const data = await request({
                    action: "set_provider_secret",
                    provider: "groq",
                    secret: groqKey.trim(),
                  });
                  setBusy(null);
                  if (data?.ok) {
                    setGroqKey("");
                    setStatusText("Groq 저장 완료");
                    void refreshProviders();
                  }
                }}
              >
                {busy === "groq" ? "저장 중..." : "Groq 키 저장"}
              </button>

              <label
                style={{
                  display: "block",
                  margin: "16px 0 6px",
                  color: "#9aa1aa",
                  fontSize: 12,
                }}
              >
                Sanity Write Token
              </label>
              <input
                style={input}
                type="password"
                value={sanityKey}
                onChange={(event) => setSanityKey(event.target.value)}
                placeholder="변경할 때만 입력"
              />
              <button
                style={{ ...secondary, marginTop: 8 }}
                onClick={async () => {
                  if (!sanityKey.trim()) return;
                  setBusy("sanity");
                  const data = await request({
                    action: "set_provider_secret",
                    provider: "sanity",
                    secret: sanityKey.trim(),
                  });
                  setBusy(null);
                  if (data?.ok) {
                    setSanityKey("");
                    setStatusText("Sanity 저장 완료");
                    void refreshProviders();
                  }
                }}
              >
                {busy === "sanity" ? "저장 중..." : "Sanity 토큰 저장"}
              </button>
            </div>
          </details>
        </section>

        <section style={card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 900 }}>JARVIS 상태</div>
            <div style={{ color: tone.color, fontSize: 12, fontWeight: 800 }}>
              {state.title}
            </div>
          </div>

          <div
            style={{
              marginTop: 9,
              color: "#f1f3f5",
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            {statusText}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 12px",
              marginTop: 9,
              color: "#7f8792",
              fontSize: 11,
            }}
          >
            {knowledgeCheckedAt ? (
              <span>Knowledge 확인 {knowledgeCheckedAt}</span>
            ) : null}
            {providerCheckedAt ? (
              <span>Provider 확인 {providerCheckedAt}</span>
            ) : null}
          </div>

          <details style={{ marginTop: 12 }}>
            <summary
              style={{
                cursor: "pointer",
                color: "#717985",
                fontSize: 12,
              }}
            >
              개발자 상세
            </summary>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                background: "#0d0f12",
                padding: 12,
                borderRadius: 12,
                maxHeight: 320,
                overflow: "auto",
                fontSize: 11,
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
