import type { Metadata } from "next";
import Link from "next/link";

const principles = [
  {
    number: "01",
    english: "CREATE",
    title: "AI로 더 빠르게 만듭니다",
    description:
      "아이디어를 글과 이미지, 코드와 결과물로 옮기는 과정에서 AI를 적극적으로 활용합니다.",
  },
  {
    number: "02",
    english: "VERIFY",
    title: "사람이 끝까지 확인합니다",
    description:
      "그럴듯한 답에 멈추지 않고 출처와 맥락, 결과와 한계를 사람이 직접 살펴봅니다.",
  },
  {
    number: "03",
    english: "ARCHIVE",
    title: "배운 것을 지식으로 남깁니다",
    description:
      "확인한 내용과 직접 해본 경험을 흩어두지 않고 다시 꺼내 쓸 수 있도록 차곡차곡 기록합니다.",
  },
];

const learningSteps = [
  {
    number: "01",
    title: "쉽게 이해하고",
    description:
      "어려운 AI와 데이터 개념을 누구나 이해할 수 있는 언어로 풉니다.",
  },
  {
    number: "02",
    title: "직접 해보고",
    description:
      "읽는 데서 끝내지 않고 작은 실습과 프로젝트로 직접 확인합니다.",
  },
  {
    number: "03",
    title: "다시 설명하고",
    description: "배운 것을 자신의 언어로 정리하며 진짜 내 지식으로 만듭니다.",
  },
  {
    number: "04",
    title: "함께 쌓아갑니다",
    description:
      "각자의 질문과 검증 경험이 다음 사람을 위한 지식이 되게 합니다.",
  },
];

const archives = [
  {
    title: "Knowledge",
    description: "오래 남겨야 할 개념과 생각",
    href: "/knowledge",
  },
  {
    title: "Lecture",
    description: "처음부터 차근차근 배우는 강의",
    href: "/lecture",
  },
  {
    title: "AI Update",
    description: "매일 달라지는 AI의 중요한 변화",
    href: "/ai-update",
  },
  {
    title: "Practice",
    description: "직접 만들고 결과를 확인하는 실습",
    href: "/practice",
  },
  {
    title: "Books",
    description: "질문과 검증을 오래 남기는 책",
    href: "/books",
  },
];

export const metadata: Metadata = {
  title: "About | DECHIVE",
  description:
    "AI는 만들고 인간은 검증합니다. 누구나 AI를 쉽게 배우고 직접 확인하며 지식을 함께 쌓는 DECHIVE를 소개합니다.",
};

function NumberedHeading({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-editorial text-sm opacity-50">{number}</span>
      <h2 className="font-editorial text-xl font-semibold sm:text-2xl">
        {children}
      </h2>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-4 pb-8 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-7 border-b border-[color:rgb(9_41_68_/_18%)] py-7 lg:grid-cols-[minmax(0,0.58fr)_minmax(360px,0.42fr)] lg:items-stretch lg:gap-12 lg:py-9">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-4 text-[11px] tracking-[0.12em]">
            <span className="font-bold text-[var(--terracotta)]">ABOUT</span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <span className="opacity-52">WHY DECHIVE</span>
          </div>

          <h1 className="font-editorial mt-5 text-[2.45rem] leading-[1.16] font-semibold tracking-[-0.05em] sm:text-5xl lg:text-[3.25rem]">
            AI는 만들고,
            <br />
            인간은 검증합니다.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 opacity-68 sm:text-[15px]">
            DECHIVE는 누구나 AI를 쉽게 이해하고 사용할 수 있도록 지식을
            정리합니다. AI가 만들어낸 가능성을 사람이 직접 확인하고, 배운 것과
            해본 것을 함께 쌓아 더 나은 질문으로 이어갑니다.
          </p>
        </div>

        <div className="relative isolate flex min-h-[280px] items-center justify-center overflow-hidden border border-[color:rgb(9_41_68_/_14%)] bg-[color:rgb(255_255_255_/_18%)] px-7 py-9 sm:min-h-[310px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgb(185_79_44_/_9%),transparent_36%),linear-gradient(135deg,transparent_54%,rgb(9_41_68_/_5%))]" />
          <div className="relative w-full max-w-md">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="border-y border-[color:rgb(9_41_68_/_20%)] py-5 text-center">
                <p className="text-[10px] font-bold tracking-[0.22em] text-[var(--terracotta)]">
                  AI
                </p>
                <p className="font-editorial mt-2 text-2xl font-semibold">
                  Creates
                </p>
              </div>
              <span
                className="text-xl text-[var(--terracotta)]"
                aria-hidden="true"
              >
                →
              </span>
              <div className="border-y border-[color:rgb(9_41_68_/_20%)] py-5 text-center">
                <p className="text-[10px] font-bold tracking-[0.22em] text-[var(--terracotta)]">
                  HUMANS
                </p>
                <p className="font-editorial mt-2 text-2xl font-semibold">
                  Verify
                </p>
              </div>
            </div>
            <p className="font-editorial mt-7 text-center text-base leading-7 text-[var(--terracotta)]">
              만들 수 있다는 가능성을,
              <br />
              믿을 수 있는 지식으로.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-6">
        <NumberedHeading number="01">DECHIVE가 믿는 것</NumberedHeading>
        <div className="mt-5 grid gap-3 sm:pl-9 md:grid-cols-3">
          {principles.map((principle) => (
            <article
              key={principle.number}
              className="border border-[color:rgb(9_41_68_/_11%)] bg-[color:rgb(255_255_255_/_14%)] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-editorial text-sm text-[var(--terracotta)]">
                  {principle.number}
                </span>
                <span className="text-[9px] font-bold tracking-[0.2em] opacity-42">
                  {principle.english}
                </span>
              </div>
              <h3 className="font-editorial mt-5 text-lg font-semibold">
                {principle.title}
              </h3>
              <p className="mt-2 text-xs leading-5 opacity-60">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-6">
        <NumberedHeading number="02">
          누구나 AI를 쉽게 사용하기까지
        </NumberedHeading>
        <div className="mt-5 divide-y divide-[color:rgb(9_41_68_/_12%)] border-y border-[color:rgb(9_41_68_/_14%)] sm:ml-9 lg:grid lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {learningSteps.map((step) => (
            <article key={step.number} className="px-4 py-5 lg:px-5">
              <span className="font-editorial text-sm text-[var(--terracotta)]">
                {step.number}
              </span>
              <h3 className="font-editorial mt-3 text-base font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-5 opacity-58">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-6">
        <NumberedHeading number="03">모든 지식을 한곳에</NumberedHeading>
        <div className="mt-5 grid gap-0 border-y border-[color:rgb(9_41_68_/_14%)] sm:ml-9 md:grid-cols-2 xl:grid-cols-5 xl:divide-x xl:divide-[color:rgb(9_41_68_/_12%)]">
          {archives.map((archive) => (
            <Link
              key={archive.title}
              href={archive.href}
              className="group border-b border-[color:rgb(9_41_68_/_12%)] px-4 py-5 transition-colors hover:bg-[color:rgb(255_255_255_/_22%)] xl:border-b-0 xl:px-5 md:[&:nth-last-child(-n+2)]:border-b-0"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-editorial text-base font-semibold">
                  {archive.title}
                </h3>
                <span
                  className="text-[var(--terracotta)] transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-4 opacity-56">
                {archive.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--terracotta)]">
            LEARN · VERIFY · ARCHIVE
          </p>
          <h2 className="font-editorial mt-3 text-2xl leading-snug font-semibold sm:text-3xl">
            같이 배우고, 같이 확인하고,
            <br className="sm:hidden" /> 같이 쌓아갑니다.
          </h2>
          <p className="mt-3 max-w-2xl text-xs leading-6 opacity-62 sm:text-[13px]">
            정답을 대신 말해주는 곳이 아니라, 더 좋은 질문을 발견하고 직접
            확인할 수 있도록 돕는 지식 아카이브가 되겠습니다.
          </p>
        </div>
        <Link
          href="/knowledge"
          className="inline-flex h-10 w-fit items-center border border-[var(--terracotta)] px-5 text-xs font-semibold text-[var(--terracotta)] transition-colors hover:bg-[var(--terracotta)] hover:text-[#fffaf2]"
        >
          지식 둘러보기 →
        </Link>
      </section>
    </main>
  );
}
