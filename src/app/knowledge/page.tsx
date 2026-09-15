import type { Metadata } from "next";

type MockImageProps = {
  label: string;
  className?: string;
};

const knowledgeStories = [
  {
    date: "2026.09.05",
    dateTime: "2026-09-05",
    title: "좋은 질문이 좋은 데이터셋을 만든다",
    description:
      "좋은 데이터는 좋은 질문에서 시작됩니다. 문제를 어떻게 정의하느냐에 따라 수집할 데이터와 결과의 깊이가 달라집니다.",
    meta: "8 min read",
  },
  {
    date: "2026.09.03",
    dateTime: "2026-09-03",
    title: "데이터 시대의 바람직한 사고란 무엇인가",
    description:
      "데이터를 보는 관점과 맥락을 읽는 힘, 그리고 불확실함을 다루는 태도에 관해 이야기합니다.",
    meta: "7 min read",
  },
  {
    date: "2026.09.01",
    dateTime: "2026-09-01",
    title: "RAG란 무엇인가",
    description:
      "외부 지식을 활용하는 AI의 작동 원리와 RAG의 개념, 구조, 실제 활용 사례를 쉽게 살펴봅니다.",
    meta: "9 min read",
  },
  {
    date: "2026.08.30",
    dateTime: "2026-08-30",
    title: "데이터를 읽는 새로운 방법",
    description:
      "숫자와 사실 너머의 의미를 읽어내고 데이터의 맥락과 한계를 발견하는 방법을 소개합니다.",
    meta: "6 min read",
  },
];

export const metadata: Metadata = {
  title: "Knowledge | DECHIVE",
  description: "질문하고 확인하며 쌓아가는 DECHIVE의 지식 아카이브",
};

function MockImage({ label, className = "" }: MockImageProps) {
  return (
    <div
      className={`mock-image flex items-center justify-center ${className}`}
      role="img"
      aria-label={`${label} 이미지 준비 중`}
    >
      <span>{label}</span>
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-4 pb-8 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_18%)] pb-6 lg:grid-cols-[minmax(0,0.41fr)_minmax(0,0.59fr)] lg:items-stretch lg:gap-10">
        <div className="flex flex-col justify-center py-5 lg:pr-3">
          <div className="flex items-center gap-4 text-xs tracking-[0.08em]">
            <span className="font-bold text-[var(--terracotta)]">
              KNOWLEDGE
            </span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <time className="opacity-50" dateTime="2026-09-06">
              2026.09.06
            </time>
          </div>

          <h1 className="font-editorial mt-5 text-[2.25rem] leading-[1.16] font-semibold tracking-[-0.045em] sm:text-5xl lg:text-[3.25rem]">
            Dataset이란 무엇인가
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 opacity-68 sm:text-[15px]">
            데이터셋은 모아둔 데이터가 아니라 만들어진 결과입니다. 무엇을 넣고
            무엇을 뺄지, 어디서 구할지, 누가 정할지에 대한 선택이 모여 하나의
            데이터셋이 됩니다. 데이터셋을 보는 새로운 관점과 그 중요성을
            살펴봅니다.
          </p>
          <span className="mt-7 w-fit border-b border-[var(--terracotta)] pb-1 text-sm font-semibold text-[var(--terracotta)]">
            읽어보기 →
          </span>
        </div>

        <MockImage
          label="FEATURED MOCK IMAGE"
          className="aspect-[16/9] lg:aspect-auto lg:min-h-[290px]"
        />
      </section>

      <section className="py-6">
        <h2 className="text-sm font-bold tracking-[0.24em] sm:text-base">
          LATEST KNOWLEDGE
        </h2>

        <div className="mt-4 divide-y divide-[color:rgb(9_41_68_/_14%)] border-y border-[color:rgb(9_41_68_/_16%)]">
          {knowledgeStories.map((story) => (
            <article
              key={story.title}
              className="grid gap-4 py-5 sm:grid-cols-[minmax(180px,0.34fr)_minmax(0,0.66fr)] sm:items-center sm:gap-6 lg:grid-cols-[minmax(260px,0.3fr)_minmax(0,0.7fr)] lg:gap-8"
            >
              <MockImage
                label="MOCK IMAGE"
                className="aspect-[16/7] sm:aspect-[16/6]"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-3 text-[11px] tracking-[0.06em]">
                  <span className="font-bold text-[var(--terracotta)]">
                    KNOWLEDGE
                  </span>
                  <span className="h-px w-4 bg-[var(--terracotta)] opacity-60" />
                  <time className="opacity-48" dateTime={story.dateTime}>
                    {story.date}
                  </time>
                </div>
                <h3 className="font-editorial mt-2 text-xl leading-snug font-semibold sm:text-[1.35rem]">
                  {story.title}
                </h3>
                <p className="mt-1.5 max-w-3xl text-xs leading-5 opacity-62 sm:text-[13px]">
                  {story.description}
                </p>
                <p className="mt-2 text-[11px] opacity-48">{story.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
