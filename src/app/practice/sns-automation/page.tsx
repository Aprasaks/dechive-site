import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
    phase: "STRUCTURE",
    title: "판매 규칙 설계하기",
    description: "트리거, 제한시간, 다음 순번으로 넘어가는 조건을 정합니다.",
    result: "완성되는 것 · 자동화 규칙표",
  },
  {
    number: "02",
    phase: "CONNECT",
    title: "Meta 계정 연결하기",
    description: "Instagram 계정을 연결하고 게시·댓글·DM 권한을 확인합니다.",
    result: "완성되는 것 · 테스트 계정 연결",
  },
  {
    number: "03",
    phase: "PUBLISH",
    title: "게시물과 트리거 만들기",
    description: "상품 이미지나 영상을 올리고 구매 댓글 키워드를 설정합니다.",
    result: "완성되는 것 · 판매 게시물 1건",
  },
  {
    number: "04",
    phase: "AUTOMATE",
    title: "순번 자동화 검증하기",
    description:
      "댓글 감지부터 DM 전송, 시간 만료와 다음 순번 승계를 시험합니다.",
    result: "완성되는 것 · 댓글 → DM → 자동 승계",
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
  title: "SNS 선착순 판매 자동화 | DECHIVE Practice",
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
    <div className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 sm:grid-cols-[42px_minmax(0,1fr)] sm:gap-4">
      <span className="font-editorial border-t border-[var(--terracotta)] pt-2 text-sm text-[var(--terracotta)]">
        {number}
      </span>
      <div>
        <h2 className="font-editorial text-xl leading-tight font-semibold sm:text-2xl">
          {children}
        </h2>
        {description ? (
          <p className="mt-1.5 text-[11px] leading-5 opacity-55 sm:text-xs">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-3 pb-7 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <nav
        className="flex items-center gap-2 py-4 text-[10px] opacity-52"
        aria-label="현재 위치"
      >
        <Link href="/practice" className="transition-opacity hover:opacity-65">
          PRACTICE
        </Link>
        <span aria-hidden="true">/</span>
        <span>01 SNS AUTOMATION</span>
      </nav>

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
            preload
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-contain"
          />
        </div>
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="lg:pr-7 xl:pr-8">
          <section
            id="practice-goals"
            className="scroll-mt-20 border-b border-[color:rgb(9_41_68_/_14%)] py-8 sm:py-10"
          >
            <NumberedHeading
              number="01"
              description="기능을 따라 만드는 데서 끝나지 않고, 자동화의 구조를 직접 설명하는 것이 목표입니다."
            >
              실습 목표
            </NumberedHeading>
            <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <figure className="overflow-hidden border border-[color:rgb(9_41_68_/_11%)] bg-[#e9dfd0]">
                <div className="relative aspect-[3/2]">
                  <Image
                    src="/images/practice-workflow-studio.png"
                    alt="작업대 위 상품과 노트북을 보며 판매 자동화 순서를 설계하는 모습"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 65vw, 32vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-[color:rgb(9_41_68_/_10%)] px-4 py-3 text-[10px] leading-4 opacity-58">
                  먼저 코드를 보는 것이 아니라, 상품·댓글·시간·순번이 어떻게
                  연결되는지 한 장의 흐름으로 정리합니다.
                </figcaption>
              </figure>

              <div className="grid gap-2.5">
                {goals.map((goal) => (
                  <article
                    key={goal.number}
                    className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3 border border-[color:rgb(9_41_68_/_10%)] bg-[color:rgb(255_255_255_/_22%)] p-4"
                  >
                    <span
                      className="font-editorial flex size-10 items-center justify-center border border-[color:rgb(185_79_44_/_22%)] bg-[color:rgb(185_79_44_/_5%)] text-base text-[var(--terracotta)]"
                      aria-hidden="true"
                    >
                      {goal.symbol}
                    </span>
                    <div>
                      <span className="text-[9px] tracking-[0.12em] text-[var(--terracotta)]">
                        GOAL {goal.number}
                      </span>
                      <h3 className="font-editorial mt-1 text-[13px] leading-5 font-semibold sm:text-sm">
                        {goal.title}
                      </h3>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="preparation"
            className="scroll-mt-20 border-b border-[color:rgb(9_41_68_/_14%)] py-8 sm:py-10"
          >
            <NumberedHeading
              number="02"
              description="계정과 상품 자료를 먼저 준비하면 중간에 흐름이 끊기지 않습니다."
            >
              준비물
            </NumberedHeading>
            <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
              <div className="flex flex-col justify-between border border-[color:rgb(9_41_68_/_10%)] bg-[color:rgb(185_79_44_/_3%)] p-5 sm:p-6">
                <ul className="divide-y divide-[color:rgb(9_41_68_/_10%)] border-y border-[color:rgb(9_41_68_/_10%)]">
                  {materials.map((material, index) => (
                    <li
                      key={material}
                      className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3 py-4 text-xs leading-5"
                    >
                      <span className="font-editorial text-[var(--terracotta)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-[10px] leading-4 opacity-52">
                  처음에는 실제 판매 상품 하나만 준비해도 충분합니다. 테스트가
                  끝난 뒤 여러 게시물로 확장합니다.
                </p>
              </div>

              <figure className="overflow-hidden border border-[color:rgb(9_41_68_/_11%)] bg-[#e9dfd0]">
                <div className="relative aspect-[4/3] min-h-[230px]">
                  <Image
                    src="/images/practice-product-capture.png"
                    alt="스마트폰으로 한정판 재킷 상품 사진을 촬영하는 모습"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 38vw"
                    className="object-cover object-[center_48%]"
                  />
                </div>
                <figcaption className="border-t border-[color:rgb(9_41_68_/_10%)] px-4 py-3 text-[10px] leading-4 opacity-58">
                  이미지와 영상은 실제 게시 전에 미리보기로 확인할 수 있는
                  파일을 준비합니다.
                </figcaption>
              </figure>
            </div>
          </section>

          <section
            id="practice-steps"
            className="scroll-mt-20 border-b border-[color:rgb(9_41_68_/_14%)] py-8 sm:py-10"
          >
            <NumberedHeading
              number="03"
              description="각 단계마다 눈에 보이는 결과를 하나씩 남기며 진행합니다."
            >
              실습 단계
            </NumberedHeading>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {steps.map((step) => (
                <li
                  key={step.number}
                  className="group relative min-h-[178px] overflow-hidden border border-[color:rgb(9_41_68_/_11%)] bg-[color:rgb(255_255_255_/_20%)] p-5 sm:p-6"
                >
                  <span className="font-editorial absolute -right-2 -bottom-7 text-[7rem] leading-none text-[color:rgb(9_41_68_/_4%)] transition-colors group-hover:text-[color:rgb(185_79_44_/_7%)]">
                    {step.number}
                  </span>
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[9px] tracking-[0.15em] text-[var(--terracotta)]">
                        STEP {step.number}
                      </span>
                      <span className="text-[9px] tracking-[0.12em] opacity-42">
                        {step.phase}
                      </span>
                    </div>
                    <h3 className="font-editorial mt-5 text-lg font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-[11px] leading-5 opacity-60">
                      {step.description}
                    </p>
                    <p className="mt-5 text-[10px] font-semibold text-[var(--terracotta)]">
                      {step.result}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="verification" className="scroll-mt-20 py-8 sm:py-10">
            <NumberedHeading
              number="04"
              description="기능이 한 번 작동하는 것보다, 예외 상황에서도 순번이 지켜지는지가 중요합니다."
            >
              검증 질문
            </NumberedHeading>
            <div className="mt-6 grid border border-[color:rgb(9_41_68_/_10%)] bg-[color:rgb(185_79_44_/_3%)] sm:grid-cols-2">
              {verificationQuestions.map((question, index) => (
                <article
                  key={question}
                  className={`min-h-28 border-[color:rgb(9_41_68_/_10%)] p-5 ${index < verificationQuestions.length - 1 ? "border-b" : ""} ${index % 2 === 0 ? "sm:border-r" : ""} ${index >= 2 ? "sm:border-b-0" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-editorial text-sm text-[var(--terracotta)]">
                      Q{String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="size-3 border border-[color:rgb(9_41_68_/_30%)]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="font-editorial mt-4 text-[13px] leading-5 font-semibold sm:text-sm">
                    {question}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="border-t border-[color:rgb(9_41_68_/_14%)] py-8 lg:border-t-0 lg:border-l lg:pl-7 xl:pl-8">
          <div className="space-y-4 lg:sticky lg:top-20">
            <nav
              aria-label="실습 페이지 목차"
              className="border-y border-[color:rgb(9_41_68_/_14%)] py-4"
            >
              <p className="text-[9px] tracking-[0.14em] text-[var(--terracotta)]">
                PRACTICE MAP
              </p>
              <ol className="mt-3 space-y-1.5 text-[11px]">
                {[
                  ["01", "실습 목표", "#practice-goals"],
                  ["02", "준비물", "#preparation"],
                  ["03", "실습 단계", "#practice-steps"],
                  ["04", "검증 질문", "#verification"],
                ].map(([number, label, href]) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 py-1.5 transition-colors hover:text-[var(--terracotta)]"
                    >
                      <span className="font-editorial opacity-45">
                        {number}
                      </span>
                      <span>{label}</span>
                      <span aria-hidden="true">↓</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

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
          </div>
        </aside>
      </div>

      <nav
        className="mt-4 grid gap-3 border-t border-[color:rgb(9_41_68_/_14%)] pt-8 sm:grid-cols-2"
        aria-label="다른 실습"
      >
        <Link
          href="/practice"
          className="border border-[color:rgb(9_41_68_/_12%)] p-5 transition-colors hover:border-[var(--terracotta)]"
        >
          <span className="text-[9px] tracking-[0.12em] opacity-45">
            ← ALL PRACTICES
          </span>
          <strong className="font-editorial mt-2 block text-base font-semibold">
            실습 목록으로 돌아가기
          </strong>
        </Link>
        <Link
          href="/practice/naver-publisher"
          className="border border-[color:rgb(9_41_68_/_12%)] p-5 text-right transition-colors hover:border-[var(--terracotta)]"
        >
          <span className="text-[9px] tracking-[0.12em] opacity-45">
            NEXT PRACTICE →
          </span>
          <strong className="font-editorial mt-2 block text-base font-semibold">
            02 NAVER PUBLISHER
          </strong>
        </Link>
      </nav>
    </main>
  );
}
