import type { Metadata } from "next";
import Image from "next/image";

const goals = [
  {
    number: "01",
    symbol: "◉",
    title: "원하는 판매 자동화의 흐름과 규칙을 설명할 수 있습니다.",
  },
  {
    number: "02",
    symbol: "▥",
    title: "Meta 앱을 이용해 Instagram 판매 자동화를 제작할 수 있습니다.",
  },
  {
    number: "03",
    symbol: "▤",
    title: "추후 기능을 수정할 때 영향을 받는 범위를 정확히 짚을 수 있습니다.",
  },
];

const materials = [
  "Meta 계정 (Facebook, Instagram)",
  "판매할 상품 이미지와 영상",
];

const steps = [
  {
    number: "01",
    title: "판매 규칙 설계하기",
    description: "트리거, 제한시간, 다음 순번으로 넘어가는 조건을 정합니다.",
  },
  {
    number: "02",
    title: "Meta 계정 연결하기",
    description: "Instagram 계정을 연결하고 게시·댓글·DM 권한을 확인합니다.",
  },
  {
    number: "03",
    title: "게시물과 트리거 만들기",
    description: "상품 이미지나 영상을 올리고 구매 댓글 키워드를 설정합니다.",
  },
  {
    number: "04",
    title: "순번 자동화 검증하기",
    description:
      "댓글 감지부터 DM 전송, 시간 만료와 다음 순번 승계를 시험합니다.",
  },
];

const verificationQuestions = [
  "같은 댓글이 두 번 수집되어도 한 번만 대기열에 들어가나요?",
  "제한시간이 지나면 다음 사람에게 구매권과 DM이 정확히 넘어가나요?",
  "여러 게시물을 동시에 추적해도 댓글과 순번이 서로 섞이지 않나요?",
  "이미지·영상 형식이 달라져도 수정해야 할 범위를 설명할 수 있나요?",
];

const commonMistakes = [
  {
    title: "게시물마다 트리거를 분리하세요.",
    description:
      "같은 키워드라도 게시물 ID와 함께 구분해야 댓글과 순번이 섞이지 않습니다.",
  },
  {
    title: "같은 댓글을 두 번 처리하지 마세요.",
    description:
      "댓글 ID를 기준으로 중복 처리를 막아야 구매 대기열이 꼬이지 않습니다.",
  },
  {
    title: "제한시간은 서버 시간을 기준으로 판단하세요.",
    description: "화면을 닫아도 만료와 다음 순번 승계가 계속되어야 합니다.",
  },
  {
    title: "Meta 권한을 단계별로 확인하세요.",
    description:
      "게시·댓글 조회·DM 권한 중 하나라도 빠지면 자동화가 중단됩니다.",
  },
];

export const metadata: Metadata = {
  title: "Practice | DECHIVE",
  description:
    "하나뿐인 상품의 구매 순번과 제한시간을 자동으로 관리하는 SNS 선착순 판매 자동화 실습",
};

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

          <h1 className="font-editorial mt-4 text-[1.75rem] leading-[1.22] font-semibold tracking-[-0.04em] sm:text-[2.05rem] lg:text-[2.15rem] xl:text-[2.3rem]">
            하나뿐인 상품을 파는
            <br />
            SNS 선착순 판매 자동화
          </h1>
          <p className="font-editorial mt-2 text-base leading-7 opacity-80 sm:text-lg">
            댓글 순서대로 구매권을 부여하고, 시간이 지나면 다음 순번으로
            자동으로 넘깁니다.
          </p>
          <p className="mt-4 max-w-xl text-[13px] leading-6 opacity-66 sm:text-sm">
            모든 구매 희망자에게 동시에 결제 링크를 보내는 방식이 아닙니다.
            하나뿐인 상품이기에 댓글 순서대로 구매권을 부여하고, 제한시간이
            지나면 다음 순번으로 자동 승계되는 판매 자동화 시스템을 만듭니다.
          </p>
          <p className="mt-3 text-[11px] opacity-52 sm:text-xs">
            난이도 중급 · 준비물: Meta 계정 / 상품 이미지·영상
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#practice-steps"
              className="inline-flex h-9 items-center bg-[var(--terracotta)] px-6 text-xs font-semibold text-[#fffaf2] transition-opacity hover:opacity-85"
            >
              실습 시작하기 →
            </a>
            <a
              href="/practice/sns-sales"
              className="inline-flex h-9 items-center border border-[var(--terracotta)] px-5 text-xs font-semibold text-[var(--terracotta)] transition-colors hover:bg-[var(--terracotta)] hover:text-[#fffaf2]"
            >
              프로그램 사용하기 →
            </a>
          </div>
        </div>

        <div className="relative aspect-[16/8] overflow-hidden border border-[color:rgb(9_41_68_/_12%)] bg-[#f7f1e7] lg:aspect-auto lg:min-h-[292px]">
          <Image
            src="/images/practice-sns-queue.png"
            alt="Instagram 게시물과 댓글 순번, DM 결제 링크, 제한시간 자동 승계 흐름"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-contain"
          />
        </div>
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
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
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
          <section className="border border-[color:rgb(9_41_68_/_12%)] bg-[color:rgb(255_255_255_/_18%)] p-5">
            <h2 className="font-editorial flex items-center gap-2 text-lg font-semibold">
              <span className="text-[var(--terracotta)]" aria-hidden="true">
                ◇
              </span>
              실수하기 쉬운 포인트
            </h2>
            <p className="mt-2 text-[10px] leading-4 opacity-52">
              실제 자동화에서는 아래 항목이 순번 오류를 가장 자주 만듭니다.
            </p>
            <ol className="mt-4 divide-y divide-[color:rgb(9_41_68_/_10%)] border-t border-[color:rgb(9_41_68_/_10%)]">
              {commonMistakes.map((mistake, index) => (
                <li
                  key={mistake.title}
                  className="grid grid-cols-[25px_minmax(0,1fr)] gap-2.5 py-3"
                >
                  <span className="font-editorial pt-0.5 text-[11px] text-[var(--terracotta)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong className="block text-[11px] leading-4 font-semibold">
                      {mistake.title}
                    </strong>
                    <span className="mt-1 block text-[10px] leading-4 opacity-58">
                      {mistake.description}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </main>
  );
}
