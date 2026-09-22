export function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(value))
    .replaceAll(". ", ".")
    .replace(/\.$/, "");
}

export function readingTime(text: string) {
  const compactLength = text.replace(/\s/g, "").length;

  return Math.max(1, Math.ceil(compactLength / 500));
}

export function splitKnowledgeTitle(title: string) {
  const separator = " — ";
  const separatorIndex = title.indexOf(separator);

  if (separatorIndex === -1) {
    return { headline: title, subheading: null };
  }

  return {
    headline: title.slice(0, separatorIndex),
    subheading: title.slice(separatorIndex + separator.length),
  };
}
