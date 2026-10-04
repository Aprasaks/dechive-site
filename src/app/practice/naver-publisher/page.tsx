import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const flow = [
  {
    number: "01",
    title: "완성된 원고 · 이미지",
    description:
      "입력은 새 글을 만드는 단계가 아니라 이미 완성된 원고와 사용할 이미지를 가져오는 단계로 잡았습니다.",
  },
  {
    number: "02",
    title: "구조 판별 · 배치",
    description:
      "원문은 유지한 채 본문·소제목·인용구·구분선을 나누고 이미지가 들어갈 위치를 블록 단위로 결정합니다.",
  },
  {
    number: "03",
    title: "같은 구조로 미리보기",
    description:
      "전송에 사용할 같은 블록 구조를 네이버 형태로 먼저 렌더링해, 보내기 전에 결과를 확인하도록 했습니다.",
  },
  {
    number: "04",
    title: "SmartEditor · 임시저장",
    description:
      "확인한 블록을 연결 프로그램이 네이버 SmartEditor로 옮기고 임시저장합니다. 공개 발행은 자동화하지 않습니다.",
  },
];

const sources = [
  "유튜브 대본",
  "Instagram · Threads 원고",
  "ChatGPT에서 완성한 글",
  "Notion · 메모",
  "기존 블로그 원고",
];

const v1Features = [
  "완성된 원고와 이미지 가져오기",
  "원문을 바꾸지 않는 구조 판별",
  "소제목 · 인용구 · 구분선 자동 배치",
  "글 흐름에 맞는 이미지 위치 정리",
  "네이버형 미리보기",
  "필요할 때만 상세 수정",
  "네이버 SmartEditor 전송 · 임시저장",
];

export const metadata: Metadata = {
  title: "NAVER PUBLISHER v1.0 구조 | DECHIVE Practice",
  description:
    "완성된 원고와 이미지를 네이버용 구조로 정리하고, 미리보기한 뒤 SmartEditor 임시저장까지 연결한 DECHIVE Practice 기록.",
};

export default function NaverPublisherPage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-3 pb-12 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <nav
        className="flex items-center gap-2 py-4 text-[11px]"
        aria-label="현재 위치"
      >
        <Link
          href="/practice"
          className="transition-colors hover:text-[var(--terracotta)]"
        >
          PRACTICE
        </Link>
        <span aria-hidden="true">/</span>
        <span>02 NAVER PUBLISHER</span>
      </nav>

      <section className="grid gap-7 border-b border-[color:rgb(9_41_68_/_17%)] pb-9 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] lg:items-stretch lg:gap-10">
        <div className="flex flex-col justify-center py-6 lg:pr-4">
          <div className="flex flex-wrap items-center gap-3 text-[12px] tracking-[0.08em]">
            <span className="font-bold text-[var(--terracotta)]">
              PRACTICE 02
            </span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <span>NAVER PUBLISHER</span>
            <span className="border border-[var(--terracotta)] px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-[var(--terracotta)]">
              v1.0
            </span>
          </div>

          <h1 className="font-editorial mt-6 text-[2.2rem] leading-[1.14] font-semibold tracking-[-0.045em] sm:text-[2.8rem] lg:text-[3.2rem]">
            네이버 블로그 발행을
            <br />
            이런 구조로 만들어봤습니다.
          </h1>

          <p className="font-editorial mt-4 text-lg leading-8 sm:text-xl">
            완성된 원고와 이미지를 가져와 구조를 정리하고,
            <br className="hidden sm:block" /> 네이버에서 어떻게 보일지 확인한 뒤
            임시저장까지 연결합니다.
          </p>

          <p className="mt-5 max-w-xl text-[14px] leading-7">
            이 페이지는 서비스를 판매하기 위한 소개가 아니라, 네이버에 글을
            옮길 때 반복되는 편집 작업을 어떤 구조로 줄였는지 기록한
            Practice입니다. v1.0에서는 글을 새로 쓰지 않고, 이미 있는 콘텐츠를
            옮기는 흐름에만 집중했습니다.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="/practice/naver-publisher/app"
              className="inline-flex h-12 items-center bg-[var(--terracotta)] px-7 text-[13px] font-semibold text-[#fffaf2] transition-opacity hover:opacity-85"
            >
              v1.0 실제 화면 보기 →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center border border-[color:rgb(9_41_68_/_24%)] px-6 text-[13px] font-semibold transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
            >
              v1.0 구조 보기 ↓
            </a>
          </div>

          <p className="mt-4 text-[12px]">
            자동화 범위는 임시저장까지. 최종 공개 발행은 사람이 결정하도록
            남겼습니다.
          </p>
        </div>

        <figure className="overflow-hidden border border-[color:rgb(9_41_68_/_12%)] bg-[#e9dfd0]">
          <div className="relative aspect-[3/2] h-full min-h-[340px]">
            <Image
              src="/images/practice-naver-publisher.png"
              alt="블록으로 정리된 글을 노트북에서 검토하는 콘텐츠 작성자"
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 56vw"
              className="object-cover"
            />
          </div>
        </figure>
      </section>

      <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-9 sm:py-11">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
          <div>
            <p className="text-[11px] tracking-[0.14em] text-[var(--terracotta)]">
              ONE CONTENT, ANOTHER CHANNEL
            </p>
            <h2 className="font-editorial mt-3 text-2xl leading-tight font-semibold sm:text-3xl">
              출발점은 단순했습니다.
              <br />
              이미 있는 글을 왜 다시 편집해야 할까?
            </h2>
            <p className="mt-4 max-w-md text-[13px] leading-6">
              유튜브 대본이든, SNS 원고든, 이미 완성된 글이라면 내용은 그대로
              두고 네이버에 필요한 편집만 자동화하면 된다고 봤습니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {sources.map((source) => (
              <div
                key={source}
                className="flex min-h-20 items-center border border-[color:rgb(9_41_68_/_12%)] bg-[color:rgb(255_255_255_/_22%)] px-5"
              >
                <span className="mr-3 text-[var(--terracotta)]">→</span>
                <span className="text-[14px] font-semibold">{source}</span>
              </div>
            ))}
            <div className="flex min-h-20 items-center bg-[var(--navy)] px-5 text-[#fffaf2]">
              <span className="mr-3 text-[var(--terracotta)]">→</span>
              <span className="text-[14px] font-semibold">NAVER BLOG</span>
            </div>
          </div>
        </div>
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
            v1.0 구조는
            <br />
            네 단계면 충분했습니다.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((item, index) => (
            <article
              key={item.number}
              className="relative min-h-48 border border-[color:rgb(9_41_68_/_12%)] bg-[color:rgb(255_255_255_/_22%)] p-5"
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

      <section className="grid gap-7 border-b border-[color:rgb(9_41_68_/_14%)] py-10 sm:py-12 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] tracking-[0.14em] text-[var(--terracotta)]">
              VERSION 1.0
            </p>
            <span className="bg-[var(--terracotta)] px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-[#fffaf2]">
              CURRENT
            </span>
          </div>
          <h2 className="font-editorial mt-3 text-2xl font-semibold sm:text-3xl">
            자동화할 것과
            <br />사람에게 남길 것을 나눴습니다.
          </h2>
          <p className="mt-4 max-w-sm text-[13px] leading-6">
            소제목·인용구·구분선·이미지 배치는 자동화하지만, 글 자체를 새로
            쓰거나 최종 공개를 대신 결정하지 않습니다. 반복 작업만 줄이고
            사람의 판단은 마지막에 남기는 것이 v1.0의 기준입니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {v1Features.map((feature, index) => (
            <div
              key={feature}
              className="grid grid-cols-[34px_minmax(0,1fr)] items-center border border-[color:rgb(9_41_68_/_12%)] px-4 py-4"
            >
              <span className="font-editorial text-[12px] text-[var(--terracotta)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[13px] font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 text-center sm:py-16">
        <p className="text-[11px] tracking-[0.14em] text-[var(--terracotta)]">
          NAVER PUBLISHER v1.0
        </p>
        <h2 className="font-editorial mt-3 text-3xl font-semibold">
          v1.0의 핵심은 기능 수가 아니라 흐름입니다.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7">
          원고 + 이미지 → 구조 정리 → 네이버 미리보기 → SmartEditor 임시저장.
          이 정도면 반복 편집을 줄이는 첫 버전으로 충분하다고 판단했습니다.
        </p>
        <Link
          href="/practice/naver-publisher/app"
          className="mt-6 inline-flex h-12 items-center bg-[var(--navy)] px-7 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
        >
          v1.0 실제 화면 확인하기 →
        </Link>
      </section>

      <nav className="grid gap-3 sm:grid-cols-2" aria-label="다른 실습">
        <Link
          href="/practice/sns-automation"
          className="border border-[color:rgb(9_41_68_/_12%)] p-5 transition-colors hover:border-[var(--terracotta)]"
        >
          <span className="text-[10px] tracking-[0.12em]">
            ← PREVIOUS PRACTICE
          </span>
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
