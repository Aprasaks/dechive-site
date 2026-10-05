"use client";

import { useEffect, useMemo, useState } from "react";

const COMMAND_URL =
  "https://pexoeftnkbcowauxhopf.supabase.co/functions/v1/jarvis-command";
const IMAGE_UPLOAD_URL =
  "https://pexoeftnkbcowauxhopf.supabase.co/functions/v1/jarvis-image-upload";

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
  pipeline_stage?: string;
  text_verified?: boolean;
  image_verified?: boolean;
  image_model?: string;
  image_preview_url?: string | null;
  sanity_asset_id?: string | null;
  image_verification?: {
    verdict?: string;
    score?: number;
    issues?: string[];
  };
  image_error?: string | null;
  image_prompt?: string | null;
  image_rule?: string | null;
  image_rule_version?: string | null;
  image_verification_method?: string | null;
  image_uploaded_at?: string | null;
  review_decision?: "confirmed" | "rejected" | null;
  review_decided_at?: string | null;
  publication_cancelled?: boolean;
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
  providers?: { groq?: boolean; sanity?: boolean; openai?: boolean };
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

  if (
    status === "waiting_for_user" &&
    job.result?.pipeline_stage === "image_handoff" &&
    !job.result?.sanity_document_id
  ) {
    return {
      tone: "review",
      title: "대표 이미지 제작 필요",
      detail:
        "본문 검증이 끝났습니다. JARVIS가 준비한 요청문으로 ChatGPT에서 이미지를 만든 뒤 업로드하세요.",
      action: "image_handoff",
    };
  }

  if (
    status === "waiting_for_user" &&
    job.result?.image_verified === false &&
    !job.result?.sanity_document_id
  ) {
    return {
      tone: "error",
      title: "대표 이미지 확인 필요",
      detail:
        job.last_error ||
        job.result?.image_error ||
        "대표 이미지가 검증 기준을 통과하지 못했습니다.",
      action: "image_retry",
    };
  }

  if (status === "waiting_for_user" && job.result?.sanity_document_id) {
    if (job.result.review_decision === "confirmed") {
      return {
        tone: "review",
        title: "발행 확인 대기",
        detail: "사용자 확인이 끝났습니다. 발행 확인을 누르면 실제 발행됩니다.",
        action: "publish_confirm",
      };
    }
    if (job.result.review_decision === "rejected") {
      return {
        tone: "error",
        title: "발행 취소 대기",
        detail: "사용자가 거절했습니다. 발행 취소를 누르면 글과 대표 이미지가 삭제됩니다.",
        action: "publish_cancel",
      };
    }
    return {
      tone: "review",
      title: "사용자 승인 필요",
      detail: "글·출처·대표 이미지를 확인한 뒤 확인 또는 거절을 선택하세요.",
      action: "review_decision",
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

  if (status === "waiting_for_capability" || status === "claimed") {
    const stage = job.result?.pipeline_stage;
    if (stage === "image_generate" || stage === "image_generating") {
      return {
        tone: "working",
        title: "대표 이미지 생성 중",
        detail: "검증된 글을 바탕으로 Knowledge 대표 이미지를 만들고 있습니다.",
        action: "working",
      };
    }
    if (stage === "image_verifying") {
      return {
        tone: "working",
        title: "이미지 검증 중",
        detail: "생성된 이미지가 글의 핵심과 맞는지 독립적으로 확인하고 있습니다.",
        action: "working",
      };
    }
    if (stage === "sanity_write") {
      return {
        tone: "working",
        title: "Sanity 저장 중",
        detail: "본문과 이미지 검증이 끝나 Sanity review 문서를 만드는 중입니다.",
        action: "working",
      };
    }
    if (status === "waiting_for_capability") {
      return {
        tone: "working",
        title: "다음 단계 준비 중",
        detail: "검증 결과를 다음 Worker로 넘기고 있습니다.",
        action: "working",
      };
    }
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
  if (eventType === "job.image_handoff") return 3;
  if (eventType === "job.image_generating") return 3;
  if (eventType === "job.image_uploaded") return 4;
  if (eventType === "job.image_verifying") return 4;
  if (eventType === "job.image_ready") return 5;
  if (
    eventType === "job.waiting_for_user" ||
    eventType === "knowledge.human_approved"
  ) return 6;
  if (eventType === "job.post_verify") return 7;
  if (eventType === "job.done") return 8;
  return null;
}

function activityLabel(eventType?: string) {
  const labels: Record<string, string> = {
    "job.claimed.v2": "JARVIS가 작업을 가져왔습니다.",
    "job.researching": "자료 조사 시작",
    "job.generating": "원고 작성 시작",
    "job.verifying": "본문 독립 검증 시작",
    "job.image_handoff": "GPT 대표 이미지 제작 대기",
    "job.image_generating": "대표 이미지 생성 시작",
    "job.image_uploaded": "사용자 선택 대표 이미지 업로드 완료",
    "job.image_verifying": "대표 이미지 검증 시작",
    "job.image_ready": "대표 이미지 검증 통과",
    "job.image_rejected": "대표 이미지 검증 미통과",
    "job.image_failed": "대표 이미지 처리 오류",
    "job.provider_retry": "Provider 응답 문제 — 자동 재시도 대기",
    "job.retry_wait": "자동 재시도 대기",
    "job.waiting_for_provider": "Provider 응답 대기",
    "job.waiting_for_capability": "다음 처리 단계 대기",
    "job.capability_stage_claimed": "다음 Worker가 작업을 가져왔습니다.",
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
  const empty = [
    { label: "자료 조사", detail: "아직 시작하지 않음", state: "pending" as const },
    { label: "원고 작성", detail: "대기", state: "pending" as const },
    { label: "본문 검증", detail: "대기", state: "pending" as const },
    { label: "대표 이미지 제작", detail: "대기", state: "pending" as const },
    { label: "이미지 확인·업로드", detail: "대기", state: "pending" as const },
    { label: "Sanity 저장", detail: "대기", state: "pending" as const },
    { label: "사용자 승인", detail: "대기", state: "pending" as const },
    { label: "실제 발행", detail: "대기", state: "pending" as const },
  ];

  if (!job) return empty;

  const status = job.status ?? "";
  const result = job.result ?? {};
  const stage = result.pipeline_stage ?? "";
  const sources = result.sources ?? [];
  const textScore = result.verification?.score;
  const imageScore = result.image_verification?.score;
  const events = job.recent_activity ?? [];

  let currentStage = -1;

  if (status === "researching") currentStage = 0;
  else if (status === "generating") currentStage = 1;
  else if (status === "verifying") currentStage = 2;
  else if (
    stage === "image_handoff" ||
    stage === "image_generate" ||
    stage === "image_generating"
  ) currentStage = 3;
  else if (
    stage === "image_uploaded" ||
    stage === "image_verifying" ||
    stage === "image_review" ||
    stage === "image_error"
  ) currentStage = 4;
  else if (status === "waiting_for_user" && result.sanity_document_id) {
    currentStage = result.review_decision ? 7 : 6;
  }
  else if (status === "publishing" || status === "post_verify") currentStage = 7;
  else if (status === "done") currentStage = 8;
  else if (stage === "sanity_write" || result.sanity_document_id) currentStage = 5;

  if (
    status === "retry_wait" ||
    status === "waiting_for_provider" ||
    status === "cancelled"
  ) {
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
  const isError =
    status === "failed" ||
    status === "rejected" ||
    stage === "image_error" ||
    (stage === "image_review" && result.image_verified === false);

  const labels = [
    "자료 조사",
    "원고 작성",
    "본문 검증",
    "대표 이미지 제작",
    "이미지 확인·업로드",
    "Sanity 저장",
    "사용자 승인",
    "실제 발행",
  ];

  const details = [
    sources.length > 0 ? `${sources.length}개 출처 확인` : "공식 자료와 근거 확인",
    "Knowledge 원고 생성",
    typeof textScore === "number" ? `검증 점수 ${textScore}` : "출처와 핵심 문장 재검증",
    result.image_prompt
      ? "SITE 이미지 규칙 기반 GPT 요청문 준비 완료"
      : result.image_preview_url
        ? "대표 이미지 준비 완료"
        : "글의 핵심을 시각화",
    result.image_verification_method === "human_upload"
      ? "사용자 선택 이미지 업로드 완료"
      : result.image_verified
        ? typeof imageScore === "number"
          ? `이미지 검증 점수 ${imageScore}`
          : "이미지 검증 통과"
        : "대표 이미지를 확인하고 업로드",
    result.sanity_document_id ? "review 문서 저장 완료" : "Sanity review 문서 저장",
    result.review_decision === "confirmed"
      ? "확인 선택 완료"
      : result.review_decision === "rejected"
        ? "거절 선택 완료"
        : "사람 검토 및 승인",
    job.result_url || job.published_url
      ? "공개 페이지 확인 완료"
      : result.review_decision === "confirmed"
        ? "발행 확인을 기다리는 중"
        : result.review_decision === "rejected"
          ? "발행 취소를 기다리는 중"
          : "DECHIVE 공개 확인",
  ];

  return labels.map((label, index) => {
    if (currentStage === 8 || index < currentStage) {
      return { label, detail: details[index], state: "done" as const };
    }

    if (index === currentStage) {
      if (isError) {
        return {
          label,
          detail:
            stage === "image_review"
              ? result.image_verification?.issues?.[0] ||
                "대표 이미지가 자동 검증 기준을 통과하지 못했습니다."
              : job.last_error || result.image_error || "이 단계에서 작업이 중단됨",
          state: "error" as const,
        };
      }

      if (isWaiting) {
        return {
          label,
          detail:
            status === "cancelled"
              ? "사용자가 작업을 중지했습니다."
              : status === "waiting_for_user" && stage === "image_handoff"
                ? "ChatGPT에서 이미지를 만든 뒤 JARVIS에 업로드해주세요."
                : status === "waiting_for_user"
                  ? "사용자 확인이 필요합니다."
                  : "응답을 기다린 뒤 자동으로 다시 시도합니다.",
          state: "waiting" as const,
        };
      }

      const activeDetails = [
        "공식 자료와 근거를 찾는 중",
        "조사 결과를 바탕으로 원고 작성 중",
        "출처와 핵심 문장을 독립적으로 검증 중",
        "대표 이미지 제작 요청을 준비 중",
        "선택한 대표 이미지를 업로드하는 중",
        "Sanity review 문서를 저장 중",
        "사용자 확인을 기다리는 중",
        "공개 페이지를 확인하는 중",
      ];

      return {
        label,
        detail: activeDetails[index],
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
    openai: boolean;
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
        openai: Boolean(provider.providers.openai),
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
        openai: Boolean(data.providers.openai),
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

  async function setReviewDecision(
    jobId: string,
    decision: "confirmed" | "rejected",
  ) {
    setBusy(decision === "confirmed" ? "review-confirm" : "review-reject");
    setStatusText(
      decision === "confirmed" ? "사용자 확인 처리 중..." : "사용자 거절 처리 중...",
    );

    const data = await request({
      action: "set_review_decision",
      jobId,
      decision,
    });

    setBusy(null);

    if (data?.ok) {
      setStatusText(
        data.message ||
          (decision === "confirmed"
            ? "확인 완료. 발행 확인을 눌러주세요."
            : "거절 완료. 발행 취소를 눌러주세요."),
      );
      await refreshKnowledge(true);
    } else {
      setStatusText(data?.error || "사용자 결정 처리 실패");
    }
  }

  async function cancelPublication(jobId: string) {
    const confirmed = window.confirm(
      "발행을 취소할까요? 이 Knowledge 글과 대표 이미지가 함께 삭제됩니다.",
    );
    if (!confirmed) return;

    setBusy("publish-cancel");
    setStatusText("글과 대표 이미지 삭제 중...");

    const data = await request({
      action: "cancel_publication",
      jobId,
    });

    setBusy(null);

    if (data?.ok) {
      setStatusText("발행 취소 완료. 글과 대표 이미지가 삭제되었습니다.");
      await refreshKnowledge(true);
    } else {
      setStatusText(data?.error || "발행 취소 실패");
    }
  }

  async function approveKnowledge(jobId: string) {
    setBusy("approve");
    setStatusText("발행 확인 전달 중...");

    const data = await request({
      action: "approve_knowledge",
      jobId,
    });

    if (data?.ok) {
      setStatusText("발행 확인 완료. 실제 공개 페이지 확인 중...");
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

  async function regenerateImage(jobId?: string) {
    if (!jobId) return;
    setBusy("image-retry");
    setStatusText("대표 이미지 제작 단계로 되돌리는 중...");

    const data = await request({ action: "regenerate_image", jobId });
    setBusy(null);

    if (data?.ok) {
      setStatusText(data.message || "대표 이미지 제작 단계로 이동했습니다.");
      await refreshKnowledge(true);
    } else {
      setStatusText(data?.error || "대표 이미지 단계 이동 실패");
    }
  }

  async function copyImagePrompt() {
    const prompt = details.image_prompt?.trim();
    if (!prompt) {
      setStatusText("복사할 이미지 요청문이 없습니다.");
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt);
      setStatusText("GPT 이미지 요청문을 복사했습니다.");
    } catch {
      setStatusText("클립보드 복사에 실패했습니다. 요청문을 직접 선택해 복사하세요.");
    }
  }

  async function readImageDimensions(file: File) {
    return await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        const dimensions = {
          width: image.naturalWidth,
          height: image.naturalHeight,
        };
        URL.revokeObjectURL(url);
        resolve(dimensions);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("이미지를 읽을 수 없습니다."));
      };
      image.src = url;
    });
  }

  async function uploadKnowledgeImage(file: File, jobId: string) {
    setBusy("image-upload");
    setStatusText("대표 이미지 확인 중...");

    try {
      const dimensions = await readImageDimensions(file);
      const ratio = dimensions.width / dimensions.height;
      const target = 16 / 9;
      const offRatio = Math.abs(ratio - target) > 0.08;

      if (
        offRatio &&
        !window.confirm(
          `선택한 이미지는 ${dimensions.width}×${dimensions.height}입니다. SITE 대표 이미지는 16:9가 기준입니다. 그래도 업로드할까요?`,
        )
      ) {
        setBusy(null);
        setStatusText("대표 이미지 업로드를 취소했습니다.");
        return;
      }

      const key = deviceKey.trim();
      const token = deviceToken.trim();
      if (!key || !token) {
        throw new Error("기기 연결 정보가 없습니다.");
      }

      const form = new FormData();
      form.append("jobId", jobId);
      form.append("file", file);

      const response = await fetch(IMAGE_UPLOAD_URL, {
        method: "POST",
        headers: {
          "x-jarvis-device": key,
          "x-jarvis-token": token,
        },
        body: form,
      });
      const data = (await response.json().catch(() => ({}))) as JarvisResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "대표 이미지 업로드 실패");
      }

      setStatusText(data.message || "대표 이미지 업로드 완료. Sanity 저장을 진행합니다.");
      await refreshKnowledge(true);
    } catch (error) {
      setStatusText(
        error instanceof Error ? error.message : "대표 이미지 업로드 실패",
      );
    } finally {
      setBusy(null);
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
  const reviewDecision = details.review_decision ?? null;
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
  const currentPipelineStep = pipelineSteps.find(
    (step) => step.state === "active" || step.state === "waiting",
  );
  const showLiveMonitor = Boolean(
    isLive || isWaitingLive || busy === "start" || activeCommandId,
  );

  const providersReady = Boolean(
    providerState?.groq && providerState?.sanity,
  );
  const connectionItems = [
    { label: "iPhone", checked: true, ok: pairSaved },
    {
      label: "Groq",
      checked: providerState !== null,
      ok: Boolean(providerState?.groq),
    },
    {
      label: "Sanity",
      checked: providerState !== null,
      ok: Boolean(providerState?.sanity),
    },
  ];
  const allConnectionsReady = pairSaved && providersReady;

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
          0%, 100% {
            box-shadow:
              0 0 0 rgba(91, 214, 255, 0),
              inset 0 0 0 rgba(91, 214, 255, 0);
          }
          50% {
            box-shadow:
              0 0 30px rgba(91, 214, 255, 0.22),
              inset 0 0 22px rgba(91, 214, 255, 0.05);
          }
        }
        @keyframes jarvisRail {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(330%); }
        }
        @keyframes jarvisBars {
          0%, 100% { height: 5px; opacity: 0.45; }
          50% { height: 22px; opacity: 1; }
        }
        @keyframes jarvisBorderPulse {
          0%, 100% { border-color: rgba(91, 214, 255, 0.35); }
          50% { border-color: rgba(91, 214, 255, 0.95); }
        }
        .jarvis-live-dot {
          animation: jarvisPulse 1s ease-in-out infinite;
        }
        .jarvis-live-card {
          animation: jarvisGlow 1.8s ease-in-out infinite;
        }
        .jarvis-live-monitor {
          animation:
            jarvisGlow 1.8s ease-in-out infinite,
            jarvisBorderPulse 1.8s ease-in-out infinite;
        }
        .jarvis-sweep {
          animation: jarvisSweep 1.35s linear infinite;
        }
        .jarvis-rail {
          animation: jarvisRail 1.15s linear infinite;
        }
        .jarvis-wave-bar {
          animation: jarvisBars 0.9s ease-in-out infinite;
        }
      `}</style>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ margin: "6px 2px 14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
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
                background: allConnectionsReady ? "#15331d" : "#2a2114",
                color: allConnectionsReady ? "#93dda4" : "#e8c973",
                fontSize: 12,
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              {allConnectionsReady
                ? "연결 정상"
                : providerState === null
                  ? "연결 확인 중"
                  : "연결 확인 필요"}
            </div>
          </div>

          <details
            style={{
              marginTop: 12,
              borderRadius: 14,
              border: "1px solid #282c31",
              background: "#111318",
              overflow: "hidden",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                listStyle: "none",
                padding: "11px 12px",
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
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                  }}
                >
                  {connectionItems.map((item) => {
                    const color = !item.checked
                      ? "#858d97"
                      : item.ok
                        ? "#91dda3"
                        : "#ff9292";
                    const background = !item.checked
                      ? "#17191d"
                      : item.ok
                        ? "#102417"
                        : "#2b1515";

                    return (
                      <span
                        key={item.label}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          minHeight: 30,
                          padding: "5px 9px",
                          borderRadius: 999,
                          background,
                          color,
                          border: "1px solid #2b3036",
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 99,
                            background: color,
                            boxShadow:
                              item.checked && item.ok
                                ? `0 0 8px ${color}`
                                : "none",
                          }}
                        />
                        {item.label}
                      </span>
                    );
                  })}
                </div>

                <span
                  style={{
                    flexShrink: 0,
                    color: "#89919c",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  연결 · 설정
                </span>
              </div>
            </summary>

            <div
              style={{
                borderTop: "1px solid #282c31",
                padding: "12px",
              }}
            >
              <div
                style={{
                  color: "#9ca4ae",
                  fontSize: 12,
                  lineHeight: 1.55,
                }}
              >
                상단 표시만 보면 iPhone, Groq, Sanity 연결 여부를 바로 확인할 수 있습니다.
                대표 이미지는 현재 ChatGPT에서 제작한 뒤 JARVIS에 업로드합니다.
              </div>

              <button
                style={{ ...secondary, minHeight: 44, marginTop: 10 }}
                onClick={() => void refreshProviders()}
                disabled={providerChecking}
              >
                {providerChecking ? "연결 확인 중..." : "연결 상태 다시 확인"}
              </button>

              <button
                style={{ ...secondary, minHeight: 44, marginTop: 8 }}
                onClick={() =>
                  document
                    .getElementById("settings")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                연결 정보 · API 키 열기
              </button>

              {providerCheckedAt ? (
                <div style={{ color: "#747c87", fontSize: 11, marginTop: 8 }}>
                  마지막 Provider 확인 {providerCheckedAt}
                </div>
              ) : null}
            </div>
          </details>
        </div>

        {showLiveMonitor ? (
          <section
            className={isLive || busy === "start" || activeCommandId ? "jarvis-live-monitor" : undefined}
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 20,
              marginBottom: 14,
              padding: "16px 16px 14px",
              border: isWaitingLive
                ? "1px solid #7b672f"
                : "1px solid rgba(91,214,255,0.72)",
              background: isWaitingLive
                ? "linear-gradient(180deg, #211d11, #15130d)"
                : "radial-gradient(circle at 15% 0%, rgba(36,160,220,0.18), transparent 42%), linear-gradient(180deg, #0e1821, #0a1016)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.26,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
                backgroundSize: "100% 5px",
                pointerEvents: "none",
              }}
            />

            {!isWaitingLive ? (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  overflow: "hidden",
                  background: "rgba(91,214,255,0.12)",
                }}
              >
                <div
                  className="jarvis-rail"
                  style={{
                    width: "32%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, #8fe8ff 45%, #ffffff 50%, #8fe8ff 55%, transparent)",
                    boxShadow: "0 0 14px #69dcff",
                  }}
                />
              </div>
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
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 3,
                    height: 24,
                    width: 35,
                  }}
                >
                  {[0, 1, 2, 3, 4].map((index) => (
                    <span
                      key={index}
                      className={!isWaitingLive ? "jarvis-wave-bar" : undefined}
                      style={{
                        display: "block",
                        width: 4,
                        height: isWaitingLive ? 6 : 10,
                        borderRadius: 99,
                        background: isWaitingLive ? "#d6bd64" : "#78ddff",
                        boxShadow: isWaitingLive ? "none" : "0 0 8px rgba(120,221,255,0.7)",
                        animationDelay: `${index * 0.11}s`,
                      }}
                    />
                  ))}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      color: isWaitingLive ? "#efd276" : "#a8edff",
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                    }}
                  >
                    <span
                      className={!isWaitingLive ? "jarvis-live-dot" : undefined}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 99,
                        background: isWaitingLive ? "#d6bd64" : "#72e2ff",
                        boxShadow: isWaitingLive ? "none" : "0 0 12px #72e2ff",
                      }}
                    />
                    {isWaitingLive ? "WAITING" : "LIVE"}
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      color: "#f7fbff",
                      fontSize: 17,
                      fontWeight: 950,
                      lineHeight: 1.2,
                    }}
                  >
                    {isWaitingLive
                      ? "JARVIS 응답 대기"
                      : currentPipelineStep?.label
                        ? `${currentPipelineStep.label} 진행 중`
                        : "JARVIS 작업 실행 중"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <div
                  style={{
                    color: isWaitingLive ? "#efd276" : "#bceeff",
                    fontSize: 18,
                    fontWeight: 950,
                  }}
                >
                  {isWaitingLive && retryCountdownLabel
                    ? retryCountdownLabel
                    : elapsedLabel}
                </div>
                <div style={{ marginTop: 2, color: "#73808c", fontSize: 10 }}>
                  {isWaitingLive ? "RETRY" : "ELAPSED"}
                </div>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                marginTop: 13,
                height: 6,
                overflow: "hidden",
                borderRadius: 99,
                background: isWaitingLive
                  ? "rgba(239,210,118,0.10)"
                  : "rgba(110,220,255,0.10)",
                border: isWaitingLive
                  ? "1px solid rgba(239,210,118,0.18)"
                  : "1px solid rgba(110,220,255,0.18)",
              }}
            >
              {!isWaitingLive ? (
                <div
                  className="jarvis-rail"
                  style={{
                    width: "35%",
                    height: "100%",
                    borderRadius: 99,
                    background:
                      "linear-gradient(90deg, transparent, #49cfff 38%, #c9f6ff 50%, #49cfff 62%, transparent)",
                    boxShadow: "0 0 15px rgba(73,207,255,0.95)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "38%",
                    height: "100%",
                    borderRadius: 99,
                    background: "#b79b45",
                    opacity: 0.65,
                  }}
                />
              )}
            </div>

            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginTop: 9,
                color: "#76818c",
                fontSize: 11,
              }}
            >
              <span>
                {isWaitingLive && retryCountdownLabel
                  ? `다음 재시도까지 ${retryCountdownLabel}`
                  : lastSignalSeconds === null
                    ? "서버 신호 확인 중"
                    : `마지막 서버 신호 ${lastSignalSeconds}초 전`}
              </span>
              <span>실제 JARVIS 상태 동기화</span>
            </div>
          </section>
        ) : null}

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
            ) : state.action === "image_handoff" && knowledgeJob?.job_id ? (
              <button
                style={{
                  ...primary,
                  background: "#f0c56e",
                  color: "#211709",
                }}
                onClick={() =>
                  document
                    .getElementById("image-handoff")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
              >
                대표 이미지 만들기로 이동
              </button>
            ) : (
              state.action === "review_decision" ||
              state.action === "publish_confirm" ||
              state.action === "publish_cancel"
            ) && knowledgeJob?.job_id ? (
              <button
                style={{
                  ...secondary,
                  borderColor:
                    state.action === "publish_cancel" ? "#7c3131" : "#31557b",
                  color:
                    state.action === "publish_cancel" ? "#ff9292" : "#a5c9ff",
                }}
                onClick={() =>
                  document
                    .getElementById("pipeline-control")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
              >
                {state.action === "review_decision"
                  ? "사용자 승인 선택으로 이동"
                  : state.action === "publish_confirm"
                    ? "발행 확인으로 이동"
                    : "발행 취소로 이동"}
              </button>
            ) : state.action === "image_retry" && knowledgeJob?.job_id ? (
              <button
                style={{
                  ...primary,
                  background: "#f0c56e",
                  color: "#211709",
                }}
                onClick={() => void regenerateImage(knowledgeJob.job_id)}
                disabled={busy === "image-retry"}
              >
                {busy === "image-retry"
                  ? "대표 이미지 다시 만드는 중..."
                  : "대표 이미지 다시 생성"}
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

        <section id="pipeline-control" style={card}>
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
            {pipelineSteps.map((step, index) => {
              const meta = pipelineStateMeta(step.state);
              const isReviewStep = index === 6;
              const isPublishStep = index === 7;
              const canChooseReview =
                isReviewStep &&
                knowledgeJob?.status === "waiting_for_user" &&
                Boolean(details.sanity_document_id);
              const canPublish =
                isPublishStep &&
                knowledgeJob?.status === "waiting_for_user" &&
                reviewDecision === "confirmed";
              const canCancel =
                isPublishStep &&
                knowledgeJob?.status === "waiting_for_user" &&
                reviewDecision === "rejected";

              return (
                <div
                  key={step.label}
                  className={step.state === "active" ? "jarvis-live-card" : undefined}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "11px 12px",
                    borderRadius: 12,
                    background:
                      canPublish
                        ? "#102417"
                        : canCancel
                          ? "#271414"
                          : step.state === "active"
                            ? "#101821"
                            : "#0f1114",
                    border:
                      canPublish
                        ? "1px solid #2f7a45"
                        : canCancel
                          ? "1px solid #7c3131"
                          : step.state === "active"
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
                      position: "relative",
                      display: "grid",
                      gridTemplateColumns: "34px 1fr auto",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          isReviewStep && reviewDecision === "confirmed"
                            ? "#102417"
                            : isReviewStep && reviewDecision === "rejected"
                              ? "#2b1515"
                              : meta.background,
                        color:
                          isReviewStep && reviewDecision === "confirmed"
                            ? "#91dda3"
                            : isReviewStep && reviewDecision === "rejected"
                              ? "#ff9292"
                              : meta.color,
                        fontWeight: 900,
                      }}
                    >
                      {meta.icon}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>
                        {step.label}
                      </div>
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
                        color:
                          canPublish
                            ? "#91dda3"
                            : canCancel
                              ? "#ff9292"
                              : meta.color,
                        fontSize: 11,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isReviewStep && reviewDecision === "confirmed"
                        ? "확인"
                        : isReviewStep && reviewDecision === "rejected"
                          ? "거절"
                          : meta.label}
                    </div>
                  </div>

                  {canChooseReview ? (
                    <div
                      style={{
                        position: "relative",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginTop: 10,
                      }}
                    >
                      <button
                        style={{
                          ...secondary,
                          minHeight: 42,
                          padding: "10px 12px",
                          background:
                            reviewDecision === "confirmed" ? "#123321" : "#12251b",
                          borderColor:
                            reviewDecision === "confirmed" ? "#5ee69a" : "#2f7a45",
                          color: "#91dda3",
                          boxShadow:
                            reviewDecision === "confirmed"
                              ? "0 0 18px rgba(94,230,154,0.16)"
                              : "none",
                        }}
                        onClick={() =>
                          void setReviewDecision(knowledgeJob!.job_id!, "confirmed")
                        }
                        disabled={busy === "review-confirm" || busy === "review-reject"}
                      >
                        {busy === "review-confirm" ? "확인 중..." : "✓ 확인"}
                      </button>

                      <button
                        style={{
                          ...secondary,
                          minHeight: 42,
                          padding: "10px 12px",
                          background:
                            reviewDecision === "rejected" ? "#351717" : "#271515",
                          borderColor:
                            reviewDecision === "rejected" ? "#ff6f61" : "#7c3131",
                          color: "#ff9292",
                          boxShadow:
                            reviewDecision === "rejected"
                              ? "0 0 18px rgba(255,111,97,0.14)"
                              : "none",
                        }}
                        onClick={() =>
                          void setReviewDecision(knowledgeJob!.job_id!, "rejected")
                        }
                        disabled={busy === "review-confirm" || busy === "review-reject"}
                      >
                        {busy === "review-reject" ? "거절 중..." : "× 거절"}
                      </button>
                    </div>
                  ) : null}

                  {isPublishStep && knowledgeJob?.status === "waiting_for_user" ? (
                    <div
                      style={{
                        position: "relative",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginTop: 10,
                      }}
                    >
                      <button
                        style={{
                          ...secondary,
                          minHeight: 42,
                          padding: "10px 12px",
                          background: canPublish ? "#123321" : "#171a1e",
                          borderColor: canPublish ? "#5ee69a" : "#30353b",
                          color: canPublish ? "#91dda3" : "#626b75",
                          opacity: canPublish ? 1 : 0.7,
                        }}
                        onClick={() =>
                          canPublish
                            ? void approveKnowledge(knowledgeJob!.job_id!)
                            : undefined
                        }
                        disabled={!canPublish || busy === "approve"}
                      >
                        {busy === "approve" ? "발행 처리 중..." : "발행 확인"}
                      </button>

                      <button
                        style={{
                          ...secondary,
                          minHeight: 42,
                          padding: "10px 12px",
                          background: canCancel ? "#351717" : "#171a1e",
                          borderColor: canCancel ? "#ff6f61" : "#30353b",
                          color: canCancel ? "#ff9292" : "#626b75",
                          opacity: canCancel ? 1 : 0.7,
                        }}
                        onClick={() =>
                          canCancel
                            ? void cancelPublication(knowledgeJob!.job_id!)
                            : undefined
                        }
                        disabled={!canCancel || busy === "publish-cancel"}
                      >
                        {busy === "publish-cancel" ? "삭제 중..." : "발행 취소"}
                      </button>
                    </div>
                  ) : null}

                  {isPublishStep && reviewDecision ? (
                    <div
                      style={{
                        position: "relative",
                        marginTop: 8,
                        color:
                          reviewDecision === "confirmed" ? "#78c992" : "#e58179",
                        fontSize: 11,
                        lineHeight: 1.45,
                      }}
                    >
                      {reviewDecision === "confirmed"
                        ? "확인 선택 완료 · 발행 확인을 누르면 실제 공개 단계로 넘어갑니다."
                        : "거절 선택 완료 · 발행 취소를 누르면 글과 대표 이미지가 함께 삭제됩니다."}
                    </div>
                  ) : null}
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

        {state.action === "image_handoff" && knowledgeJob?.job_id ? (
          <section
            id="image-handoff"
            style={{ ...card, borderColor: "#875322", background: "#211a10" }}
          >
            <div style={{ fontWeight: 900, fontSize: 18 }}>대표 이미지 제작</div>
            <div
              style={{
                marginTop: 7,
                color: "#c7b590",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              본문 검증은 끝났습니다. 아래 요청문은 현재 DECHIVE SITE 기준인
              <strong> Dark Editorial · 16:9</strong> 규칙으로 준비되어 있습니다.
              ChatGPT에서 이미지를 만든 뒤 이 화면으로 돌아와 업로드하세요.
            </div>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #3b3428",
                background: "#0d0f12",
              }}
            >
              <div style={{ color: "#8e96a0", fontSize: 11, fontWeight: 900 }}>
                GPT IMAGE REQUEST · {details.image_rule_version || "SITE"}
              </div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  margin: "9px 0 0",
                  color: "#d7dbe1",
                  fontSize: 12,
                  lineHeight: 1.55,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {details.image_prompt || "이미지 요청문을 준비하지 못했습니다."}
              </pre>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 10,
              }}
            >
              <button
                style={{ ...secondary, minHeight: 44 }}
                onClick={() => void copyImagePrompt()}
                disabled={!details.image_prompt}
              >
                요청문 복사
              </button>
              <button
                style={{ ...secondary, minHeight: 44 }}
                onClick={() => window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer")}
              >
                ChatGPT 열기
              </button>
            </div>

            <label
              style={{
                ...primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 9,
                background: "#91dda3",
                cursor: busy === "image-upload" ? "wait" : "pointer",
                opacity: busy === "image-upload" ? 0.65 : 1,
              }}
            >
              {busy === "image-upload" ? "이미지 업로드 중..." : "완성 이미지 선택 & 업로드"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy === "image-upload"}
                style={{ display: "none" }}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.currentTarget.value = "";
                  if (file) {
                    void uploadKnowledgeImage(file, knowledgeJob.job_id!);
                  }
                }}
              />
            </label>

            <div
              style={{
                marginTop: 9,
                color: "#9a8b70",
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              SITE 기준: 16:9 · Dark Editorial · 이미지 안 긴 텍스트 없음 ·
              generic AI 로봇/뇌/회로 남발 금지. 업로드 후 Sanity 저장 단계는 자동으로 이어집니다.
            </div>
          </section>
        ) : null}

        {details.image_preview_url &&
        (
          state.action === "review_decision" ||
          state.action === "publish_confirm" ||
          state.action === "publish_cancel" ||
          state.action === "image_retry"
        ) ? (
          <section
            style={{
              ...card,
              borderColor:
                details.image_verified === true ? "#2f7a45" : "#754a25",
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
              <div style={{ fontWeight: 900, fontSize: 17 }}>대표 이미지</div>
              <div
                style={{
                  color:
                    details.image_verified === true ? "#91dda3" : "#f2b66d",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {details.image_verified === true
                  ? `검증 통과${typeof details.image_verification?.score === "number" ? ` · ${details.image_verification.score}점` : ""}`
                  : `확인 필요${typeof details.image_verification?.score === "number" ? ` · ${details.image_verification.score}점` : ""}`}
              </div>
            </div>

            <img
              src={details.image_preview_url}
              alt={title + " 대표 이미지 미리보기"}
              style={{
                display: "block",
                width: "100%",
                aspectRatio: "16 / 9",
                objectFit: "cover",
                borderRadius: 14,
                marginTop: 12,
                border: "1px solid #30353b",
              }}
            />

            {details.image_verification?.issues?.length ? (
              <div
                style={{
                  marginTop: 10,
                  color: "#aeb4bd",
                  fontSize: 12,
                  lineHeight: 1.55,
                }}
              >
                {details.image_verification.issues.slice(0, 3).join(" · ")}
              </div>
            ) : null}
          </section>
        ) : null}

        {(
          state.action === "review_decision" ||
          state.action === "publish_confirm" ||
          state.action === "publish_cancel"
        ) && knowledgeJob ? (
          <section style={{ ...card, borderColor: "#754a25" }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>발행 전 최종 검토</div>
            <div style={{ color: "#aeb4bd", marginTop: 6, lineHeight: 1.55 }}>
              글·출처·대표 이미지를 확인한 뒤 작업 진행 현황의
              <strong> 확인 / 거절</strong>을 선택하세요. 확인 후에는
              <strong> 발행 확인</strong>, 거절 후에는
              <strong> 발행 취소</strong>가 활성화됩니다.
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
              고급 설정
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
              <div style={{ fontWeight: 800 }}>Provider 키</div>
              <div
                style={{
                  marginTop: 7,
                  color: "#858d97",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                연결 상태 확인은 상단 연결 바에서 합니다. Groq는 조사·원고·본문 검증,
                Sanity는 이미지 저장·review·발행에 사용합니다. 대표 이미지는 ChatGPT에서
                만든 결과를 JARVIS에 업로드하는 방식으로 연결합니다.
              </div>

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
