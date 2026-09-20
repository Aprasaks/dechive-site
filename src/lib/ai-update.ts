import type { AiUpdateSummary } from "@/sanity/lib/types";

const SEOUL_TIME_ZONE = "Asia/Seoul";

function dateKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function formatUpdateDate(value: string) {
  return dateKey(value).replaceAll("-", ".");
}

export function formatUpdateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: SEOUL_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function relativeDateLabel(key: string) {
  const today = dateKey(new Date());
  const yesterday = dateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  if (key === today) return "TODAY";
  if (key === yesterday) return "YESTERDAY";
  return "UPDATE";
}

export function groupAiUpdates(updates: AiUpdateSummary[]) {
  const grouped = new Map<string, AiUpdateSummary[]>();

  for (const update of updates) {
    const key = dateKey(update.publishedAt);
    const group = grouped.get(key) ?? [];
    group.push(update);
    grouped.set(key, group);
  }

  return Array.from(grouped, ([key, items]) => ({
    key,
    label: relativeDateLabel(key),
    date: key.replaceAll("-", "."),
    items,
  }));
}
