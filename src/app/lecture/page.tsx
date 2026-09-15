import type { Metadata } from "next";

type MockImageProps = {
  label: string;
  className?: string;
};

const learningPoints = [
  {
    number: "01",
    title: "데이터셋의 개념과 구조",
    description: "데이터셋이 무엇이며 어떤 형태로 구성되는지 이해합니다.",
  },
  {
    number: "02",
    title: "데이터가 만들어지는 과정",
    description: "수집, 선택, 가공, 라벨링까지 전체 과정을 살펴봅니다.",
  },
  {
    number: "03",
    title: "좋은 데이터셋을 판단하는 기준",
    description: "신뢰할 수 있는 데이터의 조건과 품질을 점검합니다.",
  },
  {
    number: "04",
    title: "실제 사례를 통한 응용",
    description: "다양한 분야의 사례를 통해 실무적 감각을 기릅니다.",
  },
];

const curriculum = [
  {
    title: "데이터셋은 무엇인가",
    description: "데이터셋의 정의와 역할, 일상 속 데이터의 예시",
    duration: "12 min",
  },
  {
    title: "데이터는 어떻게 선택되는가",
    description: "필요한 데이터를 수집하고 선택하는 방법",
    duration: "15 min",
  },
  {
    title: "라벨과 정답은 어떻게 붙는가",
    description: "라벨링의 원리와 다양한 방식",
    duration: "18 min",
  },
  {
    title: "좋은 데이터셋의 조건",
    description: "신뢰성, 다양성, 편향, 품질을 판단하는 기준",
    duration: "17 min",
  },
  {
    title: "대표적인 사례 읽기",
    description: "텍스트, 이미지, 음성 데이터셋 사례",
    duration: "20 min",
  },
  {
    title: "직접 검토해보기",
    description: "작은 데이터셋을 살펴보고 확인하는 실습",
    duration: "20 min",
  },
];

export const metadata: Metadata = {
  title: "Lecture | DECHIVE",
  description: "데이터셋의 본질을 차근차근 이해하는 DECHIVE 입문 강의",
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

function NumberedHeading({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-editorial text-sm opacity-55">{number}</span>
      <h2 className="font-editorial text-lg font-semibold sm:text-xl">
        {children}
      </h2>
    </div>
  );
}

export default function LecturePage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-3 pb-7 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_18%)] pb-4 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-stretch lg:gap-9">
        <div className="flex flex-col justify-center py-4 lg:pr-3">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.08em]">
            <span className="font-bold text-[var(--terracotta)]">LECTURE</span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <span className="opacity-52">입문 강의</span>
          </div>

          <h1 className="font-editorial mt-4 text-[2.15rem] leading-[1.18] font-semibold tracking-[-0.04em] sm:text-[2.7rem] lg:text-[2.9rem]">
            데이터셋을 이해하는
            <br />첫 번째 강의
          </h1>
          <p className="mt-4 max-w-xl text-[13px] leading-6 opacity-66 sm:text-sm">
            데이터셋이란 무엇이고, 어떻게 만들어지며, 무엇을 확인해야 하는지
            기초부터 차근차근 배웁니다. 실제 사례와 함께 데이터의 본질을
            이해하고, 더 나은 질문을 할 수 있는 힘을 기르는 입문 강의입니다.
          </p>
          <a
            href="#curriculum"
            className="mt-5 inline-flex h-9 w-fit items-center bg-[var(--terracotta)] px-6 text-xs font-semibold text-[#fffaf2] transition-opacity hover:opacity-85"
          >
            강의 보기 →
          </a>
        </div>

        <MockImage
          label="LECTURE FEATURED IMAGE"
          className="aspect-[16/8] lg:aspect-auto lg:min-h-[272px]"
        />
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="lg:pr-7 xl:pr-8">
          <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-4">
            <NumberedHeading number="01">강의 소개</NumberedHeading>
            <div className="mt-3 space-y-2 pl-0 text-xs leading-5.5 opacity-66 sm:pl-9 sm:text-[13px]">
              <p>
                이 강의는 AI 시대의 출발점이 되는 데이터셋을 쉽고 체계적으로
                이해할 수 있도록 구성했습니다. 데이터셋이 무엇인지, 어떤 과정을
                거쳐 만들어지는지, 그리고 실제로 데이터를 다룰 때 무엇을
                확인해야 하는지를 다양한 사례와 함께 살펴봅니다.
              </p>
              <p>
                복잡한 수식보다 개념과 흐름에 집중하여 처음 접하는 분들도 부담
                없이 따라올 수 있습니다. 강의를 마치면 데이터를 바라보는 시야가
                넓어지고 더 좋은 질문을 던질 수 있게 됩니다.
              </p>
            </div>
          </section>

          <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-4">
            <NumberedHeading number="02">이 강의에서 배우는 것</NumberedHeading>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {learningPoints.map((point) => (
                <article
                  key={point.number}
                  className="border border-[color:rgb(9_41_68_/_10%)] bg-[color:rgb(255_255_255_/_16%)] p-3"
                >
                  <span className="font-editorial text-sm font-semibold text-[var(--terracotta)]">
                    {point.number}
                  </span>
                  <h3 className="font-editorial mt-2 text-sm leading-snug font-semibold">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-4 opacity-56">
                    {point.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section id="curriculum" className="scroll-mt-16 py-4">
            <NumberedHeading number="03">커리큘럼</NumberedHeading>
            <ol className="mt-3 divide-y divide-[color:rgb(9_41_68_/_12%)] border-y border-[color:rgb(9_41_68_/_14%)]">
              {curriculum.map((lesson, index) => (
                <li
                  key={lesson.title}
                  className="grid grid-cols-[30px_minmax(0,1fr)_auto_24px] items-center gap-2 py-2 text-xs sm:grid-cols-[34px_190px_minmax(0,1fr)_52px_24px]"
                >
                  <span className="font-editorial text-center opacity-52">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong className="font-editorial text-[13px] leading-snug font-semibold">
                    {lesson.title}
                  </strong>
                  <span className="hidden truncate text-[11px] opacity-50 sm:block">
                    {lesson.description}
                  </span>
                  <span className="text-[10px] whitespace-nowrap text-[var(--terracotta)]">
                    {lesson.duration}
                  </span>
                  <span
                    className="flex size-5 items-center justify-center rounded-full border border-[var(--terracotta)] text-[8px] text-[var(--terracotta)]"
                    aria-hidden="true"
                  >
                    ▶
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="border-t border-[color:rgb(9_41_68_/_14%)] py-5 lg:border-t-0 lg:border-l lg:pl-7 xl:pl-8">
          <a
            href="/downloads/dataset-lecture-notes.pdf"
            download
            className="grid grid-cols-[42px_minmax(0,1fr)_34px] items-center gap-3 border border-[color:rgb(9_41_68_/_14%)] p-3 transition-colors hover:bg-[color:rgb(255_255_255_/_22%)]"
            aria-label="강의 노트 PDF 다운로드"
          >
            <span
              className="flex size-10 items-center justify-center border border-[color:rgb(185_79_44_/_24%)] text-lg text-[var(--terracotta)]"
              aria-hidden="true"
            >
              ▤
            </span>
            <span>
              <strong className="font-editorial block text-sm font-semibold">
                강의 노트 PDF
              </strong>
              <span className="mt-0.5 block text-[11px] leading-4 opacity-55">
                핵심 내용을 정리한 노트를 내려받으세요.
              </span>
            </span>
            <span
              className="flex size-8 items-center justify-center rounded-full border border-[var(--terracotta)] text-sm text-[var(--terracotta)]"
              aria-hidden="true"
            >
              ↓
            </span>
          </a>

          <blockquote className="mt-4 border border-[color:rgb(9_41_68_/_12%)] px-5 py-6 text-center">
            <p className="font-editorial text-base leading-7 text-[var(--terracotta)]">
              “좋은 데이터는 더 나은 세상을 묻는 질문에서 시작된다.”
            </p>
            <footer className="mt-3 text-[10px] tracking-[0.2em] opacity-55">
              — DECHIVE
            </footer>
          </blockquote>

          <section className="mt-5">
            <h2 className="font-editorial text-lg font-semibold">추천 강의</h2>
            <article className="mt-3 grid grid-cols-[116px_minmax(0,1fr)] gap-3 border-t border-[color:rgb(9_41_68_/_14%)] pt-3">
              <MockImage label="MOCK" className="aspect-[4/3]" />
              <div className="self-center">
                <h3 className="font-editorial text-sm font-semibold">
                  AI Agent의 구조
                </h3>
                <p className="mt-1 text-[11px] leading-4 opacity-56">
                  스스로 계획하고 행동하는 AI의 설계 원리
                </p>
                <p className="mt-1.5 text-[10px] opacity-46">
                  6강 · 1시간 35분
                </p>
              </div>
            </article>
          </section>
        </aside>
      </div>
    </main>
  );
}
