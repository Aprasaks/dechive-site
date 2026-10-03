import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const flow = [
  {
    number: "01",
    title: "원고 준비",
    description: "직접 쓴 글, ChatGPT 답변, 메모를 그대로 가져옵니다.",
  },
  {
    number: "02",
    title: "네이버용 정리",
    description: "문단, 소제목, 인용구, 이미지 흐름을 읽기 좋게 정리합니다.",
  },
  {
    number: "03",
    title: "미리보기",
    description: "네이버에 올라갈 모습을 확인하고 필요한 부분만 수정합니다.",
  },
  {
    number: "04",
    title: "임시저장",
    description: "네이버 글쓰기 화면으로 보내고 임시저장까지 이어집니다.",
  },
];

const features = [
  {
    title: "이미 쓴 글에서 시작",
    description:
      "키워드를 넣고 글을 다시 생성하는 대신, 이미 가지고 있는 원고를 그대로 활용합니다.",
  },
  {
    title: "네이버에 맞는 문서 구조",
    description:
      "제목, 본문, 소제목, 인용구, 이미지, 캡션, 구분선을 한 흐름으로 정리합니다.",
  },
  {
    title: "보내기 전 미리보기",
    description:
      "자동으로 바로 발행하지 않습니다. 사람이 읽어보고 확인한 뒤 네이버로 보냅니다.",
  },
  {
    title: "최종 발행은 사람이",
    description:
      "DECHIVE는 임시저장까지 돕고, 실제 공개 발행은 네이버에서 직접 결정합니다.",
  },
];

const useCases = [
  "ChatGPT에서 원고를 이미 완성했는데 네이버에서 다시 편집하기 귀찮을 때",
  "메모나 기존 글을 네이버 블로그 형식으로 빠르게 정리하고 싶을 때",
  "이미지와 캡션까지 한 번에 확인한 뒤 네이버로 옮기고 싶을 때",
];

export const metadata: Metadata = {
  title: "NAVER PUBLISHER | DECHIVE Practice",
  description:
    "이미 작성한 글을 네이버 블로그에 맞게 정리하고 미리보기한 뒤 임시저장까지 연결하는 DECHIVE NAVER PUBLISHER",
};

export default function NaverPublisherPage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-3 pb-12 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <nav
        className="flex items-center gap-2 py-4 text-[11px]"
        aria-label="현재 위치"
      >
        <Link href="/practice" className="transition-colors hover:text-[var(--terracotta)]">
          PRACTICE
        </Link>
        <span aria-hidden="true">/</span>
        <span>02 NAVER PUBLISHER</span>
      </nav>

      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_17%)] pb-8 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:items-stretch lg:gap-9">
        <div className="flex flex-col justify-center py-5 lg:pr-3">
          <div className="flex items-center gap-3 text-[12px] tracking-[0.08em]">
            <span className="font-bold text-[var(--terracotta)]">PRACTICE 02</span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <span>NAVER PUBLISHER</span>
          </div>

          <h1 className="font-editorial mt-5 text-[2.15rem] leading-[1.16] font-semibold tracking-[-0.045em] sm:text-[2.7rem] lg:text-[3rem]">
            글은 이미 있으세요?
            <br />
            그냥 붙여넣으세요.
          </h1>
          <p className="font-editorial mt-4 text-lg leading-8 sm:text-xl">
            네이버에서 다시 편집하는 시간을 줄입니다.
          </p>
          <p className="mt-4 max-w-xl text-[14px] leading-7">
            직접 쓴 원고, ChatGPT 답변, 기존 글을 넣으면 네이버 블로그에 맞는
            문단과 소제목, 인용구, 이미지 흐름으로 정리합니다. 미리보기로
            확인한 뒤 네이버 임시저장까지 이어집니다.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="/practice/naver-publisher/app"
              className="inline-flex h-11 items-center bg-[var(--terracotta)] px-6 text-[13px] font-semibold text-[#fffaf2] transition-opacity hover:opacity-85"
            >
              무료로 시작하기 →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center border border-[color:rgb(9_41_68_/_24%)] px-5 text-[13px] font-semibold transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
            >
              작동 방식 보기 ↓
            </a>
          </div>

          <p className="mt-4 text-[12px]">
            최종 공개 발행은 네이버에서 직접 결정합니다.
          </p>
        </div>

        <figure className="overflow-hidden border border-[color:rgb(9_41_68_/_12%)] bg-[#e9dfd0]">
          <div className="relative aspect-[3/2] h-full min-h-[330px]">
            <Image
              src="/images/practice-naver-publisher.png"
              alt="블록으로 정리된 글을 노트북에서 검토하는 콘텐츠 작성자"
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 57vw"
              className="object-cover"
            />
          </div>
        </figure>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 border-b border-[color:rgb(9_41_68_/_14%)] py-10 sm:py-12"
      >
        <div className="mb-6 max-w-2xl">
          <p className="text-[11px] tracking-[0.14em] text-[var(--terracotta)]">
            HOW IT WORKS
          </p>
          <h2 className="font-editorial mt-3 text-2xl font-semibold sm:text-3xl">
            글을 쓰는 일이 아니라,
            <br />
            옮기는 일을 줄입니다.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((item, index) => (
            <article
              key={item.number}
              className="relative min-h-44 border border-[color:rgb(9_41_68_/_12%)] bg-[color:rgb(255_255_255_/_22%)] p-5"
            >
              <span className="font-editorial text-sm text-[var(--terracotta)]">
                {item.number}
              </span>
              <h3 className="font-editorial mt-5 text-lg font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-6">{item.description}</p>
              {index < flow.length - 1 ? (
                <span
                  className="absolute top-1/2 -right-2.5 z-10 hidden -translate-y-1/2 bg-[var(--background)] px-1 text-[var(--terracotta)] lg:block"
                  aria-hidden="true"
                >
                  →
                </span>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-10 sm:py-12">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
          <div>
            <p className="text-[11px] tracking-[0.14em] text-[var(--terracotta)]">
              WHY DECHIVE
            </p>
            <h2 className="font-editorial mt-3 text-2xl leading-tight font-semibold sm:text-3xl">
              자동으로 많이 쓰는 것보다
              <br />
              이미 쓴 글을 잘 옮기는 데 집중합니다.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="border border-[color:rgb(9_41_68_/_12%)] p-5"
              >
                <h3 className="font-editorial text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[13px] leading-6">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_14%)] py-10 sm:py-12 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
        <div>
          <p className="text-[11px] tracking-[0.14em] text-[var(--terracotta)]">
            FOR WHO
          </p>
          <h2 className="font-editorial mt-3 text-2xl font-semibold sm:text-3xl">
            이런 순간을 위해 만들었습니다.
          </h2>
        </div>
        <div className="divide-y divide-[color:rgb(9_41_68_/_12%)] border-y border-[color:rgb(9_41_68_/_12%)]">
          {useCases.map((item, index) => (
            <div
              key={item}
              className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 py-4 text-[14px] leading-6"
            >
              <span className="font-editorial text-[var(--terracotta)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 text-center sm:py-16">
        <p className="text-[11px] tracking-[0.14em] text-[var(--terracotta)]">
          READY TO USE
        </p>
        <h2 className="font-editorial mt-3 text-3xl font-semibold">
          원고가 있다면 바로 시작할 수 있습니다.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7">
          프로그램 화면에서는 설명을 걷어내고, 원고 작성과 미리보기,
          네이버 임시저장에만 집중합니다.
        </p>
        <Link
          href="/practice/naver-publisher/app"
          className="mt-6 inline-flex h-12 items-center bg-[var(--navy)] px-7 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
        >
          NAVER PUBLISHER 열기 →
        </Link>
      </section>

      <nav className="grid gap-3 sm:grid-cols-2" aria-label="다른 실습">
        <Link
          href="/practice/sns-automation"
          className="border border-[color:rgb(9_41_68_/_12%)] p-5 transition-colors hover:border-[var(--terracotta)]"
        >
          <span className="text-[10px] tracking-[0.12em]">← PREVIOUS PRACTICE</span>
          <strong className="font-editorial mt-2 block text-base font-semibold">
            01 SNS 선착순 판매 자동화
          </strong>
        </Link>
        <Link
          href="/practice"
          className="border border-[color:rgb(9_41_68_/_12%)] p-5 text-right transition-colors hover:border-[var(--terracotta)]"
        >
          <span className="text-[10px] tracking-[0.12em]">ALL PRACTICES</span>
          <strong className="font-editorial mt-2 block text-base font-semibold">
            실습 목록으로 돌아가기 →
          </strong>
        </Link>
      </nav>
    </main>
  );
}
