type MockImageProps = {
  label: string;
  className?: string;
};

const latestStories = [
  {
    category: "KNOWLEDGE",
    title: "RAG란 무엇인가",
    description: "외부 지식을 활용하는 AI의 작동 원리와 가능성",
    meta: "4 min read",
  },
  {
    category: "LECTURE",
    title: "AI Agent의 구조",
    description: "스스로 계획하고 행동하는 AI의 설계 원리",
    meta: "6 min read",
  },
  {
    category: "PRACTICE",
    title: "직접 만들어보는 데이터 실습",
    description: "작은 데이터셋으로 시작하는 실전 가이드",
    meta: "8 min read",
  },
];

const knowledgeStories = [
  { title: "좋은 질문이 좋은 데이터셋을 만든다", meta: "4 min read" },
  { title: "데이터 시대의 바람직한 사고란 무엇인가", meta: "6 min read" },
];

const aiUpdates = [
  {
    date: "2026.09.05",
    title: "OpenAI, 새로운 멀티모달 모델 발표",
    description: "텍스트, 이미지, 비디오를 하나의 모델로 통합",
  },
  {
    date: "2026.09.04",
    title: "구글, Gemini 2.0 정식 출시",
    description: "더 강력한 추론과 긴 컨텍스트 지원",
  },
  {
    date: "2026.09.03",
    title: "Anthropic, Claude의 새 기능 공개",
    description: "컴퓨터 작업을 수행하는 에이전트 기능 강화",
  },
  {
    date: "2026.09.01",
    title: "국내 AI 스타트업 3곳, 글로벌 투자 유치",
    description: "K-AI의 새로운 가능성에 주목",
  },
];

const practiceStories = [
  {
    title: "나만의 RAG 챗봇 만들기",
    description: "내 문서로 질문하는 AI를 직접 만들어봅니다.",
    meta: "난이도 중급 · 12 min read",
  },
  {
    title: "데이터 시각화 대시보드 만들기",
    description: "파이썬으로 만드는 나만의 데이터 대시보드",
    meta: "난이도 초급 · 10 min read",
  },
];

const books = [
  {
    title: "만들기 전에 검증하라",
    description: "데이터, AI, 서비스의 올바른 시작",
    meta: "이호준 지음 · 2025.05.26",
  },
  {
    title: "AI 시대의 생각법",
    description: "더 나은 판단을 위한 12가지 원칙",
    meta: "김서영 지음 · 2025.03.14",
  },
  {
    title: "데이터가 묻는 질문들",
    description: "숫자 너머의 인간과 사회",
    meta: "박민정 지음 · 2024.11.02",
  },
  {
    title: "기계와 인간의 공존",
    description: "AI와 함께 살아가는 법",
    meta: "정우현 지음 · 2024.08.20",
  },
];

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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold tracking-[0.22em] text-[var(--navy)] sm:text-base">
      {children}
    </h2>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-4 pb-8 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_18%)] pb-5 lg:grid-cols-[minmax(0,0.39fr)_minmax(0,0.61fr)] lg:items-stretch lg:gap-9">
        <div className="flex flex-col justify-center py-4 lg:pr-3">
          <div className="mb-4 flex items-center gap-4 text-xs tracking-[0.08em]">
            <span className="font-bold text-[var(--terracotta)]">
              KNOWLEDGE
            </span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <time className="opacity-55" dateTime="2026-09-06">
              2026.09.06
            </time>
          </div>

          <h1 className="font-editorial text-[clamp(2.35rem,3.2vw,3.25rem)] leading-[1.14] font-semibold tracking-[-0.045em] lg:whitespace-nowrap">
            Dataset이란 무엇인가
          </h1>
          <p className="mt-4 max-w-[35rem] text-[15px] leading-7 opacity-72 sm:text-base">
            데이터셋은 단순한 데이터의 모음이 아니라, 세상을 이해하고 문제를
            해결하기 위한 출발점입니다. 무엇을 담고, 어떻게 만들며, 어떤 가치를
            가질 수 있는지 데이터셋의 본질을 살펴봅니다.
          </p>
          <button
            type="button"
            className="mt-5 w-fit bg-[var(--terracotta)] px-6 py-3 text-sm font-semibold text-[#fffaf2]"
          >
            읽어보기 <span aria-hidden="true">→</span>
          </button>
        </div>

        <MockImage
          label="FEATURED MOCK IMAGE"
          className="min-h-64 lg:min-h-[320px]"
        />
      </section>

      <section className="border-b border-[color:rgb(9_41_68_/_18%)] py-4">
        <SectionHeading>LATEST</SectionHeading>
        <div className="mt-3 grid divide-y divide-[color:rgb(9_41_68_/_14%)] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {latestStories.map((story, index) => (
            <article
              key={story.title}
              className={`grid grid-cols-[42%_1fr] gap-4 py-3 lg:py-0 ${
                index === 0
                  ? "lg:pr-6"
                  : index === latestStories.length - 1
                    ? "lg:pl-6"
                    : "lg:px-6"
              }`}
            >
              <MockImage label="MOCK IMAGE" className="aspect-[16/10]" />
              <div className="flex min-w-0 flex-col justify-center">
                <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--terracotta)]">
                  {story.category}
                </p>
                <h3 className="font-editorial mt-1.5 text-lg leading-snug font-semibold">
                  {story.title}
                </h3>
                <p className="mt-1 text-xs leading-5 opacity-68">
                  {story.description}
                </p>
                <p className="mt-1 text-xs opacity-48">{story.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid border-b border-[color:rgb(9_41_68_/_18%)] lg:grid-cols-3 lg:divide-x lg:divide-[color:rgb(9_41_68_/_14%)]">
        <div className="py-5 lg:pr-6">
          <div className="flex items-center justify-between">
            <SectionHeading>KNOWLEDGE</SectionHeading>
            <span className="text-xs text-[var(--terracotta)]">더보기 →</span>
          </div>

          <MockImage label="MOCK IMAGE" className="mt-3 aspect-[16/8]" />
          <h3 className="font-editorial mt-3 text-lg font-semibold">
            지식은 어떻게 쌓이고 검증되는가
          </h3>
          <p className="mt-1 text-xs leading-5 opacity-62">
            좋은 지식은 단순히 많이 아는 것이 아니라, 끊임없이 묻고 확인하고
            다시 설명하는 과정에서 만들어집니다.
          </p>
          <p className="mt-1.5 text-xs opacity-48">5 min read</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {knowledgeStories.map((story) => (
              <article
                key={story.title}
                className="grid grid-cols-[72px_1fr] gap-3 border-t border-[color:rgb(9_41_68_/_12%)] pt-3"
              >
                <MockImage label="MOCK" className="aspect-[4/3]" />
                <div>
                  <h4 className="font-editorial text-sm leading-snug font-semibold">
                    {story.title}
                  </h4>
                  <p className="mt-1 text-[11px] opacity-48">{story.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="border-t border-[color:rgb(9_41_68_/_14%)] py-5 lg:border-t-0 lg:px-6">
          <div className="flex items-center justify-between">
            <SectionHeading>AI UPDATE</SectionHeading>
            <span className="text-xs text-[var(--terracotta)]">더보기 →</span>
          </div>

          <div className="mt-3 divide-y divide-[color:rgb(9_41_68_/_12%)] border-t border-[color:rgb(9_41_68_/_12%)]">
            {aiUpdates.map((update) => (
              <article
                key={update.title}
                className="grid grid-cols-[80px_1fr] gap-3 py-3"
              >
                <time className="text-[11px] opacity-48" dateTime={update.date}>
                  {update.date}
                </time>
                <div>
                  <h3 className="font-editorial text-sm leading-snug font-semibold">
                    {update.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-4 opacity-52">
                    {update.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="border-t border-[color:rgb(9_41_68_/_14%)] py-5 lg:border-t-0 lg:pl-6">
          <div className="flex items-center justify-between">
            <SectionHeading>PRACTICE</SectionHeading>
            <span className="text-xs text-[var(--terracotta)]">더보기 →</span>
          </div>

          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {practiceStories.map((story) => (
              <article key={story.title}>
                <MockImage label="MOCK IMAGE" className="aspect-[16/9]" />
                <h3 className="font-editorial mt-3 text-base leading-snug font-semibold">
                  {story.title}
                </h3>
                <p className="mt-1 text-xs leading-5 opacity-62">
                  {story.description}
                </p>
                <p className="mt-1.5 text-[11px] opacity-48">{story.meta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="flex items-center justify-between">
          <SectionHeading>BOOKS</SectionHeading>
          <span className="text-xs text-[var(--terracotta)]">더보기 →</span>
        </div>

        <div className="mt-3 grid gap-5 md:grid-cols-[170px_1fr] xl:grid-cols-[170px_repeat(4,minmax(0,1fr))] xl:gap-0 xl:divide-x xl:divide-[color:rgb(9_41_68_/_14%)]">
          <p className="text-sm leading-6 opacity-60 xl:pr-6">
            좋은 책은 좋은 질문을 남깁니다.
          </p>

          {books.map((book) => (
            <article
              key={book.title}
              className="grid grid-cols-[58px_1fr] items-center gap-3 md:pl-5"
            >
              <MockImage label="BOOK" className="aspect-[3/4]" />
              <div className="min-w-0">
                <h3 className="font-editorial text-sm leading-snug font-semibold">
                  {book.title}
                </h3>
                <p className="mt-1 text-[11px] leading-4 opacity-58">
                  {book.description}
                </p>
                <p className="mt-1 text-[10px] opacity-42">{book.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
