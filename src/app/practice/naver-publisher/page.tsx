import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { NaverPublisherClient } from "./naver-publisher-client";

const flow = [
  {
    number: "01",
    title: "원고 붙여넣기",
    description: "이미 쓴 글을 그대로 입력",
  },
  { number: "02", title: "구조 정리", description: "문단과 블록으로 구분" },
  { number: "03", title: "사람이 확인", description: "형식·순서·이미지 검토" },
  {
    number: "04",
    title: "임시저장",
    description: "Bridge를 통해 네이버로 전달",
  },
];

const architecture = [
  {
    label: "WEB",
    title: "DECHIVE Publisher",
    description: "원고 입력, 블록 편집, 미리보기와 사람의 최종 확인",
  },
  {
    label: "SERVER",
    title: "Structure Engine",
    description: "AI 구조 분석, 규칙, 인증과 일회용 작업 토큰",
  },
  {
    label: "BRIDGE",
    title: "Naver Bridge",
    description: "검증된 문서 블록을 네이버 SmartEditor 임시저장으로 전달",
  },
];

const verificationQuestions = [
  "원문의 의미가 AI 정리 과정에서 달라지지 않았나요?",
  "소제목과 인용구가 문맥에 맞게 구분되었나요?",
  "이미지 위치와 설명이 읽는 흐름을 방해하지 않나요?",
  "네이버로 보낸 뒤에도 사람이 최종 발행을 결정하나요?",
];

export const metadata: Metadata = {
  title: "NAVER PUBLISHER | DECHIVE Practice",
  description:
    "이미 작성한 글을 네이버 블로그용 블록으로 정리하고 사람이 확인하는 DECHIVE Practice",
};

export default function NaverPublisherPage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-3 pb-12 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <nav
        className="flex items-center gap-2 py-4 text-[10px] opacity-52"
        aria-label="현재 위치"
      >
        <Link href="/practice" className="transition-opacity hover:opacity-65">
          PRACTICE
        </Link>
        <span aria-hidden="true">/</span>
        <span>02 NAVER PUBLISHER</span>
      </nav>

      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_17%)] pb-6 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:items-stretch lg:gap-9">
        <div className="flex flex-col justify-center py-4 lg:pr-3">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.09em]">
            <span className="font-bold text-[var(--terracotta)]">
              PRACTICE 02
            </span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <span className="opacity-52">NAVER PUBLISHER</span>
          </div>

          <h1 className="font-editorial mt-5 text-[2rem] leading-[1.18] font-semibold tracking-[-0.045em] sm:text-[2.55rem] lg:text-[2.75rem]">
            이미 쓴 글을
            <br />
            다시 편집하지 마세요.
          </h1>
          <p className="font-editorial mt-3 text-base leading-7 opacity-80 sm:text-lg">
            AI가 구조를 정리하고,
            <br className="hidden sm:block" /> 사람이 확인한 뒤 네이버에
            저장합니다.
          </p>
          <p className="mt-4 max-w-xl text-[13px] leading-6 opacity-64 sm:text-sm">
            ChatGPT 답변, 기존 원고, 메모를 그대로 붙여넣으세요. 내용을 새로
            쓰는 대신 네이버 블로그에 맞는 문단·소제목·인용구·이미지 구조로
            정리합니다.
          </p>
          <p className="mt-3 text-[11px] opacity-48">
            난이도 중급 · 준비물: 완성된 원고 / Chrome 브라우저
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <a
              href="#publisher-workspace"
              className="inline-flex h-10 items-center bg-[var(--terracotta)] px-6 text-xs font-semibold text-[#fffaf2] transition-opacity hover:opacity-85"
            >
              무료로 사용하기 →
            </a>
            <a
              href="#how-it-works"
              className="inline-flex h-10 items-center border border-[color:rgb(9_41_68_/_24%)] px-5 text-xs font-semibold transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
            >
              작동 구조 보기 ↓
            </a>
          </div>
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

      <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-8 sm:py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((item, index) => (
            <article
              key={item.number}
              className="relative border border-[color:rgb(9_41_68_/_11%)] bg-[color:rgb(255_255_255_/_18%)] p-4"
            >
              <span className="font-editorial text-sm text-[var(--terracotta)]">
                {item.number}
              </span>
              <h2 className="font-editorial mt-4 text-base font-semibold">
                {item.title}
              </h2>
              <p className="mt-1.5 text-[10px] leading-4 opacity-52">
                {item.description}
              </p>
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

      <section id="publisher-workspace" className="scroll-mt-20 py-8 sm:py-12">
        <div className="mb-6 grid gap-3 sm:grid-cols-[42px_minmax(0,1fr)] sm:gap-4">
          <span className="font-editorial border-t border-[var(--terracotta)] pt-2 text-sm text-[var(--terracotta)]">
            01
          </span>
          <div>
            <h2 className="font-editorial text-2xl font-semibold">
              원고를 붙여넣고 직접 확인하세요.
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-6 opacity-55">
              내부 마커나 네이버 서식 용어는 보여주지 않습니다. 독자가 보게 될
              문서 블록만 정리하고, 모든 결과는 사람이 다시 확인합니다.
            </p>
          </div>
        </div>
        <NaverPublisherClient />
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 border-t border-[color:rgb(9_41_68_/_15%)] py-10"
      >
        <div className="grid gap-7 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
          <div>
            <p className="text-[10px] tracking-[0.14em] text-[var(--terracotta)]">
              HOW IT WORKS
            </p>
            <h2 className="font-editorial mt-3 text-2xl leading-tight font-semibold sm:text-3xl">
              제품은 웹에,
              <br />
              연결은 Bridge에 둡니다.
            </h2>
            <p className="mt-4 text-xs leading-6 opacity-58">
              웹사이트에는 편집과 검토 경험을, 서버에는 AI와 인증을, 확장
              프로그램에는 네이버 입력 엔진만 남기는 구조입니다.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {architecture.map((item, index) => (
              <article
                key={item.label}
                className="relative min-h-44 border border-[color:rgb(9_41_68_/_11%)] p-5"
              >
                <span className="text-[9px] tracking-[0.14em] text-[var(--terracotta)]">
                  {item.label}
                </span>
                <h3 className="font-editorial mt-5 text-base font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-[10px] leading-5 opacity-55">
                  {item.description}
                </p>
                {index < architecture.length - 1 ? (
                  <span
                    className="absolute top-1/2 -right-2.5 z-10 hidden -translate-y-1/2 bg-[var(--background)] px-1 text-[var(--terracotta)] md:block"
                    aria-hidden="true"
                  >
                    →
                  </span>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid border-y border-[color:rgb(9_41_68_/_14%)] lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
        <div className="py-8 lg:border-r lg:border-[color:rgb(9_41_68_/_14%)] lg:pr-8">
          <p className="text-[10px] tracking-[0.14em] text-[var(--terracotta)]">
            HUMANS VERIFY
          </p>
          <h2 className="font-editorial mt-3 text-2xl font-semibold">
            검증 질문
          </h2>
          <p className="mt-2 text-xs leading-6 opacity-52">
            정돈된 화면이 아니라, 원문의 의미가 지켜졌는지를 확인합니다.
          </p>
        </div>
        <ol className="divide-y divide-[color:rgb(9_41_68_/_10%)] py-4 lg:pl-8">
          {verificationQuestions.map((question, index) => (
            <li
              key={question}
              className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 py-3 text-xs leading-5"
            >
              <span className="font-editorial text-[var(--terracotta)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{question}</span>
            </li>
          ))}
        </ol>
      </section>

      <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="다른 실습">
        <Link
          href="/practice/sns-automation"
          className="border border-[color:rgb(9_41_68_/_12%)] p-5 transition-colors hover:border-[var(--terracotta)]"
        >
          <span className="text-[9px] tracking-[0.12em] opacity-45">
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
          <span className="text-[9px] tracking-[0.12em] opacity-45">
            ALL PRACTICES
          </span>
          <strong className="font-editorial mt-2 block text-base font-semibold">
            실습 목록으로 돌아가기 →
          </strong>
        </Link>
      </nav>
    </main>
  );
}
