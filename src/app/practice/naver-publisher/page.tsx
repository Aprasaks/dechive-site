import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const flow = [
  {
    number: "01",
    title: "원고 · 이미지 넣기",
    description:
      "이미 완성한 원고와 사용할 이미지를 그대로 가져옵니다. 새 글을 다시 쓸 필요가 없습니다.",
  },
  {
    number: "02",
    title: "구조 자동 정리",
    description:
      "원문은 바꾸지 않고 소제목·인용구·구분선을 나누고, 이미지는 글 흐름에 맞는 위치에 배치합니다.",
  },
  {
    number: "03",
    title: "네이버 미리보기",
    description:
      "네이버에서 어떻게 보일지 먼저 확인합니다. 자동 배치가 마음에 들지 않을 때만 직접 손봅니다.",
  },
  {
    number: "04",
    title: "임시저장",
    description:
      "확인한 원고를 네이버 글쓰기 화면으로 보내고 임시저장까지 진행합니다.",
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
  title: "NAVER PUBLISHER v1.0 | DECHIVE Practice",
  description:
    "이미 만든 콘텐츠를 네이버 블로그용으로 정리하고 미리보기한 뒤 임시저장까지 연결하는 DECHIVE NAVER PUBLISHER v1.0",
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
            글도 있고, 이미지도 있다면
            <br />
            네이버용으로 다시 만들 필요 없습니다.
          </h1>

          <p className="font-editorial mt-4 text-lg leading-8 sm:text-xl">
            원고와 이미지를 넣으면 네이버에서 읽기 좋은 구조로 조립하고,
            <br className="hidden sm:block" /> 미리보기한 뒤 임시저장까지
            연결합니다.
          </p>

          <p className="mt-5 max-w-xl text-[14px] leading-7">
            DECHIVE NAVER PUBLISHER는 글을 대신 써주는 AI Writer가 아닙니다.
            이미 완성한 글과 이미지를 가져와 소제목, 인용구, 구분선, 이미지
            위치를 정리하고 네이버에 옮기는 퍼블리싱 도구입니다.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="/practice/naver-publisher/app"
              className="inline-flex h-12 items-center bg-[var(--terracotta)] px-7 text-[13px] font-semibold text-[#fffaf2] transition-opacity hover:opacity-85"
            >
              v1.0 무료로 시작하기 →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center border border-[color:rgb(9_41_68_/_24%)] px-6 text-[13px] font-semibold transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
            >
              어떻게 쓰는지 보기 ↓
            </a>
          </div>

          <p className="mt-4 text-[12px]">
            자동 공개 발행이 아니라 임시저장까지. 마지막 발행은 사람이
            결정합니다.
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
              콘텐츠는 이미 완성됐는데,
              <br />
              플랫폼마다 다시 편집하고 있습니다.
            </h2>
            <p className="mt-4 max-w-md text-[13px] leading-6">
              네이버에 올리기 위해 문단을 다시 나누고, 강조 문장을 고르고,
              이미지를 다시 배치하는 반복 작업을 줄이는 것이 v1.0의 목표입니다.
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
            글은 그대로 두고,
            <br />
            네이버에 맞는 구조만 만듭니다.
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
            v1.0은 여기까지 합니다.
            <br />더 넣지 않고 먼저 써봅니다.
          </h2>
          <p className="mt-4 max-w-sm text-[13px] leading-6">
            원고와 이미지를 네이버용 구조로 조립하고, 결과를 미리 본 뒤
            임시저장하는 흐름까지가 v1.0입니다. 다음 기능은 실제 사용에서
            필요성이 확인될 때만 추가합니다.
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
          원고와 이미지가 있다면 바로 써볼 수 있습니다.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-7">
          글을 새로 만들지 않습니다. 가지고 있는 원고와 이미지를 넣고,
          네이버 미리보기에서 결과를 확인한 뒤 임시저장하면 됩니다.
        </p>
        <Link
          href="/practice/naver-publisher/app"
          className="mt-6 inline-flex h-12 items-center bg-[var(--navy)] px-7 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
        >
          NAVER PUBLISHER v1.0 열기 →
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
