import type { Metadata } from "next";

type MockImageProps = {
  label: string;
  className?: string;
};

const goals = [
  {
    number: "01",
    symbol: "◉",
    title: "실제 데이터를 불러오고 탐색할 수 있습니다.",
  },
  {
    number: "02",
    symbol: "▥",
    title: "데이터를 처리하고 시각화할 수 있습니다.",
  },
  {
    number: "03",
    symbol: "▤",
    title: "결과를 해석하고 나만의 인사이트를 정리할 수 있습니다.",
  },
];

const materials = [
  "노트북 (Jupyter Notebook 권장)",
  "실습용 데이터 파일 (CSV)",
  "Python 3.8 이상",
  "필요한 패키지 설치 (pandas, matplotlib)",
];

const steps = [
  {
    number: "01",
    title: "데이터 불러오기",
    description: "CSV 파일을 읽고 기본 구조를 확인합니다.",
  },
  {
    number: "02",
    title: "데이터 탐색하기",
    description: "기초 통계와 결측값을 확인합니다.",
  },
  {
    number: "03",
    title: "데이터 전처리",
    description: "불필요한 값을 정리하고 분석 기준을 만듭니다.",
  },
  {
    number: "04",
    title: "데이터 시각화",
    description: "의미 있는 그래프로 결과를 표현합니다.",
  },
];

const verificationQuestions = [
  "결과가 예상과 다른가요? 그 이유는 무엇일까요?",
  "이 결과를 현재 맥락과 관련해서 해석할 수 있을까요?",
  "더 좋은 결과를 만들기 위해 무엇을 개선할 수 있을까요?",
  "이 방법을 다른 데이터에도 적용할 수 있을까요?",
];

const commonMistakes = [
  "데이터 경로가 올바른지 확인하세요.",
  "결측값 처리 방법을 신중히 선택하세요.",
  "그래프가 제대로 표시되지 않으면 한글 폰트 설정을 확인하세요.",
  "결과 해석 시 데이터의 한계를 함께 고려하세요.",
];

const nextPractices = [
  {
    title: "나만의 RAG 챗봇 만들기",
    description: "내 문서로 질문하는 AI 챗봇을 만들어봅니다.",
    meta: "중급 · 15 min read",
  },
  {
    title: "데이터 시각화 대시보드 만들기",
    description: "파이썬으로 나만의 데이터 대시보드를 만듭니다.",
    meta: "초급 · 10 min read",
  },
];

export const metadata: Metadata = {
  title: "Practice | DECHIVE",
  description:
    "실제 데이터를 직접 다루고 결과를 검증하며 배우는 DECHIVE 실습 페이지",
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
  description,
  children,
}: {
  number: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <span className="font-editorial text-sm opacity-55">{number}</span>
      <h2 className="font-editorial text-lg font-semibold sm:text-xl">
        {children}
      </h2>
      {description ? (
        <p className="text-[11px] opacity-52 sm:text-xs">{description}</p>
      ) : null}
    </div>
  );
}

export default function PracticePage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-3 pb-7 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_18%)] pb-4 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-stretch lg:gap-9">
        <div className="flex flex-col justify-center py-4 lg:pr-3">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.08em]">
            <span className="font-bold text-[var(--terracotta)]">PRACTICE</span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <span className="opacity-52">HANDS-ON PROJECT</span>
          </div>

          <h1 className="font-editorial mt-4 text-[2.15rem] leading-[1.18] font-semibold tracking-[-0.04em] sm:text-[2.7rem] lg:text-[2.9rem]">
            직접 만들어보는
            <br />
            데이터 실습
          </h1>
          <p className="font-editorial mt-2 text-base opacity-80 sm:text-lg">
            직접 만들고, 결과를 검증하고, 기록하며 더 깊이 배웁니다.
          </p>
          <p className="mt-4 max-w-xl text-[13px] leading-6 opacity-66 sm:text-sm">
            이론만으로는 부족합니다. 실제 데이터를 다루며 코드를 실행하고,
            결과를 해석하고, 나만의 인사이트를 정리하는 전 과정을 경험해보세요.
            작은 실습 하나가 큰 변화를 만듭니다.
          </p>
          <p className="mt-3 text-[11px] opacity-52 sm:text-xs">
            난이도 중급 · 12 min read · 준비물: 노트북 / CSV / Python
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#practice-steps"
              className="inline-flex h-9 items-center bg-[var(--terracotta)] px-6 text-xs font-semibold text-[#fffaf2] transition-opacity hover:opacity-85"
            >
              실습 시작하기 →
            </a>
            <a
              href="/downloads/practice-example.zip"
              download
              className="inline-flex h-9 items-center border border-[var(--terracotta)] px-5 text-xs font-semibold text-[var(--terracotta)] transition-colors hover:bg-[var(--terracotta)] hover:text-[#fffaf2]"
            >
              예제 파일 받기 ↓
            </a>
          </div>
        </div>

        <MockImage
          label="PRACTICE FEATURED IMAGE"
          className="aspect-[16/8] lg:aspect-auto lg:min-h-[292px]"
        />
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="lg:pr-7 xl:pr-8">
          <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-4">
            <NumberedHeading
              number="01"
              description="이 실습을 통해 다음과 같은 것을 할 수 있습니다."
            >
              실습 목표
            </NumberedHeading>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {goals.map((goal) => (
                <article
                  key={goal.number}
                  className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3 border border-[color:rgb(9_41_68_/_10%)] bg-[color:rgb(255_255_255_/_16%)] p-3"
                >
                  <span
                    className="font-editorial flex size-9 items-center justify-center border border-[color:rgb(185_79_44_/_20%)] bg-[color:rgb(185_79_44_/_5%)] text-base text-[var(--terracotta)]"
                    aria-hidden="true"
                  >
                    {goal.symbol}
                  </span>
                  <h3 className="font-editorial text-[13px] leading-5 font-semibold">
                    {goal.title}
                  </h3>
                </article>
              ))}
            </div>
          </section>

          <section
            id="preparation"
            className="scroll-mt-16 border-b border-[color:rgb(9_41_68_/_14%)] py-4"
          >
            <NumberedHeading
              number="02"
              description="실습을 시작하기 전에 다음을 준비해주세요."
            >
              준비물
            </NumberedHeading>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {materials.map((material) => (
                <li
                  key={material}
                  className="flex min-h-12 items-center gap-3 border border-[color:rgb(9_41_68_/_10%)] px-3 py-2 text-[11px] leading-4"
                >
                  <span
                    className="flex size-4 shrink-0 items-center justify-center bg-[var(--terracotta)] text-[9px] text-[#fffaf2]"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  {material}
                </li>
              ))}
            </ul>
          </section>

          <section
            id="practice-steps"
            className="scroll-mt-16 border-b border-[color:rgb(9_41_68_/_14%)] py-4"
          >
            <NumberedHeading
              number="03"
              description="아래 단계에 따라 차근차근 실습을 진행해보세요."
            >
              실습 단계
            </NumberedHeading>
            <ol className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step, index) => (
                <li
                  key={step.number}
                  className="relative border border-[color:rgb(9_41_68_/_10%)] bg-[color:rgb(255_255_255_/_16%)] p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-editorial flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--terracotta)] text-xs text-[#fffaf2]">
                      {step.number}
                    </span>
                    <h3 className="font-editorial text-sm font-semibold">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-3 pl-10 text-[11px] leading-4 opacity-56">
                    {step.description}
                  </p>
                  {index < steps.length - 1 ? (
                    <span
                      className="absolute top-1/2 -right-2.5 z-10 hidden -translate-y-1/2 bg-[var(--background)] px-1 text-sm text-[var(--terracotta)] xl:block"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>

          <section className="py-4">
            <NumberedHeading
              number="04"
              description="실습을 마친 후, 다음 질문을 스스로에게 던져보세요."
            >
              검증 질문
            </NumberedHeading>
            <div className="mt-3 grid gap-x-7 gap-y-3 border border-[color:rgb(9_41_68_/_10%)] bg-[color:rgb(185_79_44_/_3%)] px-4 py-4 sm:grid-cols-2 sm:px-5">
              {verificationQuestions.map((question, index) => (
                <p
                  key={question}
                  className="grid grid-cols-[24px_minmax(0,1fr)] gap-2 text-[11px] leading-5"
                >
                  <span className="font-editorial text-[var(--terracotta)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{question}</span>
                </p>
              ))}
            </div>
          </section>
        </div>

        <aside className="border-t border-[color:rgb(9_41_68_/_14%)] py-5 lg:border-t-0 lg:border-l lg:pl-7 xl:pl-8">
          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-editorial text-lg font-semibold">
                다음 실습 추천
              </h2>
              <span className="text-[11px] text-[var(--terracotta)]">
                더보기 →
              </span>
            </div>
            <div className="mt-3 divide-y divide-[color:rgb(9_41_68_/_12%)] border-y border-[color:rgb(9_41_68_/_13%)]">
              {nextPractices.map((practice) => (
                <article
                  key={practice.title}
                  className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 py-3"
                >
                  <MockImage label="MOCK" className="aspect-[4/3]" />
                  <div className="self-center">
                    <h3 className="font-editorial text-sm leading-snug font-semibold">
                      {practice.title}
                    </h3>
                    <p className="mt-1 text-[10px] leading-4 opacity-56">
                      {practice.description}
                    </p>
                    <p className="mt-1 text-[9px] opacity-44">
                      {practice.meta}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-5 border border-[color:rgb(9_41_68_/_12%)] p-4">
            <h2 className="font-editorial flex items-center gap-2 text-base font-semibold">
              <span className="text-[var(--terracotta)]" aria-hidden="true">
                ◇
              </span>
              실수하기 쉬운 포인트
            </h2>
            <ol className="mt-3 space-y-2.5">
              {commonMistakes.map((mistake, index) => (
                <li
                  key={mistake}
                  className="grid grid-cols-[22px_minmax(0,1fr)] gap-2 text-[10px] leading-4"
                >
                  <span className="font-editorial text-[var(--terracotta)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="opacity-62">{mistake}</span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </main>
  );
}
