import Image from "next/image";
import Link from "next/link";

import { formatUpdateDate } from "@/lib/ai-update";
import { formatPublishedDate, readingTime } from "@/lib/knowledge";
import { getAiUpdates } from "@/sanity/lib/ai-update";
import { getKnowledgePosts } from "@/sanity/lib/knowledge";
import { knowledgeImageUrl } from "@/sanity/lib/knowledge-image";
import type { KnowledgeSummary } from "@/sanity/lib/types";

type MockImageProps = {
  label: string;
  className?: string;
};

const latestStories = [
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

function KnowledgeImage({
  post,
  priority = false,
  sizes,
}: {
  post: KnowledgeSummary;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <Image
      src={knowledgeImageUrl(post.thumbnail, 1600, 900)}
      alt={post.thumbnail.alt}
      fill
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      sizes={sizes}
      className="object-cover"
    />
  );
}

export default async function Home() {
  const [knowledgePosts, allAiUpdates] = await Promise.all([
    getKnowledgePosts(),
    getAiUpdates(),
  ]);
  const aiUpdates = allAiUpdates.slice(0, 4);
  const [featuredKnowledge, ...moreKnowledge] = knowledgePosts;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-4 pb-8 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_18%)] pb-5 lg:grid-cols-[minmax(0,0.39fr)_minmax(0,0.61fr)] lg:items-stretch lg:gap-9">
        <div className="flex flex-col justify-center py-4 lg:pr-3">
          <div className="mb-4 flex items-center gap-4 text-xs tracking-[0.08em]">
            <span className="font-bold text-[var(--terracotta)]">
              {featuredKnowledge?.category?.toUpperCase() ?? "KNOWLEDGE"}
            </span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <time
              className="opacity-55"
              dateTime={featuredKnowledge?.publishedAt ?? "2026-09-06"}
            >
              {featuredKnowledge
                ? formatPublishedDate(featuredKnowledge.publishedAt)
                : "2026.09.06"}
            </time>
          </div>

          <h1 className="font-editorial text-[clamp(2rem,2.8vw,2.85rem)] leading-[1.16] font-semibold tracking-[-0.04em] text-balance break-keep">
            {featuredKnowledge?.title ?? "Dataset이란 무엇인가"}
          </h1>
          <p className="mt-4 max-w-[35rem] text-[15px] leading-7 opacity-72 sm:text-base">
            {featuredKnowledge?.summary ??
              "데이터셋은 단순한 데이터의 모음이 아니라, 세상을 이해하고 문제를 해결하기 위한 출발점입니다. 무엇을 담고, 어떻게 만들며, 어떤 가치를 가질 수 있는지 데이터셋의 본질을 살펴봅니다."}
          </p>
          <Link
            href={
              featuredKnowledge
                ? `/knowledge/${featuredKnowledge.slug}`
                : "/knowledge"
            }
            className="mt-5 w-fit bg-[var(--terracotta)] px-6 py-3 text-sm font-semibold text-[#fffaf2]"
          >
            읽어보기 <span aria-hidden="true">→</span>
          </Link>
        </div>

        {featuredKnowledge ? (
          <Link
            href={`/knowledge/${featuredKnowledge.slug}`}
            className="relative block min-h-64 overflow-hidden border border-[color:rgb(9_41_68_/_14%)] lg:min-h-[320px]"
            aria-label={`${featuredKnowledge.title} 읽기`}
          >
            <KnowledgeImage
              post={featuredKnowledge}
              priority
              sizes="(min-width: 1024px) 61vw, 100vw"
            />
          </Link>
        ) : (
          <MockImage
            label="FEATURED MOCK IMAGE"
            className="min-h-64 lg:min-h-[320px]"
          />
        )}
      </section>

      <section className="border-b border-[color:rgb(9_41_68_/_18%)] py-4">
        <SectionHeading>LATEST</SectionHeading>
        <div className="mt-3 grid divide-y divide-[color:rgb(9_41_68_/_14%)] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {featuredKnowledge ? (
            <article className="grid grid-cols-[42%_1fr] gap-4 py-3 lg:py-0 lg:pr-6">
              <Link
                href={`/knowledge/${featuredKnowledge.slug}`}
                className="relative block aspect-[16/10] overflow-hidden"
                aria-label={`${featuredKnowledge.title} 읽기`}
              >
                <KnowledgeImage
                  post={featuredKnowledge}
                  sizes="(min-width: 1024px) 14vw, 42vw"
                />
              </Link>
              <div className="flex min-w-0 flex-col justify-center">
                <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--terracotta)]">
                  KNOWLEDGE
                </p>
                <h3 className="font-editorial mt-1.5 text-lg leading-snug font-semibold">
                  <Link
                    href={`/knowledge/${featuredKnowledge.slug}`}
                    className="transition-opacity hover:opacity-60"
                  >
                    {featuredKnowledge.title}
                  </Link>
                </h3>
                <p className="mt-1 text-xs leading-5 opacity-68">
                  {featuredKnowledge.summary}
                </p>
                <p className="mt-1 text-xs opacity-48">
                  {readingTime(featuredKnowledge.bodyText)} min read
                </p>
              </div>
            </article>
          ) : (
            <article className="grid grid-cols-[42%_1fr] gap-4 py-3 lg:py-0 lg:pr-6">
              <MockImage label="MOCK IMAGE" className="aspect-[16/10]" />
              <div className="flex min-w-0 flex-col justify-center">
                <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--terracotta)]">
                  KNOWLEDGE
                </p>
                <h3 className="font-editorial mt-1.5 text-lg leading-snug font-semibold">
                  첫 Knowledge를 준비하고 있습니다
                </h3>
              </div>
            </article>
          )}

          {latestStories.map((story, index) => (
            <article
              key={story.title}
              className={`grid grid-cols-[42%_1fr] gap-4 py-3 lg:py-0 ${
                index === latestStories.length - 1 ? "lg:pl-6" : "lg:px-6"
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
            <Link
              href="/knowledge"
              className="text-xs text-[var(--terracotta)] transition-opacity hover:opacity-60"
            >
              더보기 →
            </Link>
          </div>

          {featuredKnowledge ? (
            <>
              <Link
                href={`/knowledge/${featuredKnowledge.slug}`}
                className="relative mt-3 block aspect-[16/8] overflow-hidden border border-[color:rgb(9_41_68_/_14%)]"
                aria-label={`${featuredKnowledge.title} 읽기`}
              >
                <KnowledgeImage
                  post={featuredKnowledge}
                  sizes="(min-width: 1024px) 31vw, 100vw"
                />
              </Link>
              <h3 className="font-editorial mt-3 text-lg font-semibold">
                <Link
                  href={`/knowledge/${featuredKnowledge.slug}`}
                  className="transition-opacity hover:opacity-60"
                >
                  {featuredKnowledge.title}
                </Link>
              </h3>
              <p className="mt-1 text-xs leading-5 opacity-62">
                {featuredKnowledge.summary}
              </p>
              <p className="mt-1.5 text-xs opacity-48">
                {readingTime(featuredKnowledge.bodyText)} min read
              </p>

              {moreKnowledge.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {moreKnowledge.slice(0, 2).map((post) => (
                    <article
                      key={post._id}
                      className="grid grid-cols-[72px_1fr] gap-3 border-t border-[color:rgb(9_41_68_/_12%)] pt-3"
                    >
                      <Link
                        href={`/knowledge/${post.slug}`}
                        className="relative block aspect-[4/3] overflow-hidden"
                        aria-label={`${post.title} 읽기`}
                      >
                        <KnowledgeImage post={post} sizes="72px" />
                      </Link>
                      <div>
                        <h4 className="font-editorial text-sm leading-snug font-semibold">
                          <Link
                            href={`/knowledge/${post.slug}`}
                            className="transition-opacity hover:opacity-60"
                          >
                            {post.title}
                          </Link>
                        </h4>
                        <p className="mt-1 text-[11px] opacity-48">
                          {readingTime(post.bodyText)} min read
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 border-t border-[color:rgb(9_41_68_/_12%)] pt-3 text-[11px] opacity-48">
                  다음 Knowledge 글을 준비하고 있습니다.
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 border-y border-[color:rgb(9_41_68_/_12%)] py-8 text-xs leading-5 opacity-50">
              첫 번째 Knowledge를 준비하고 있습니다.
            </p>
          )}
        </div>

        <div className="border-t border-[color:rgb(9_41_68_/_14%)] py-5 lg:border-t-0 lg:px-6">
          <div className="flex items-center justify-between">
            <SectionHeading>AI UPDATE</SectionHeading>
            <Link
              href="/ai-update"
              className="text-xs text-[var(--terracotta)] transition-opacity hover:opacity-60"
            >
              더보기 →
            </Link>
          </div>

          {aiUpdates.length > 0 ? (
            <div className="mt-3 divide-y divide-[color:rgb(9_41_68_/_12%)] border-t border-[color:rgb(9_41_68_/_12%)]">
              {aiUpdates.map((update) => (
                <article
                  key={update._id}
                  className="grid grid-cols-[80px_1fr] gap-3 py-3"
                >
                  <time
                    className="text-[11px] opacity-48"
                    dateTime={update.publishedAt}
                  >
                    {formatUpdateDate(update.publishedAt)}
                  </time>
                  <div>
                    <h3 className="font-editorial text-sm leading-snug font-semibold">
                      <Link
                        href={`/ai-update/${update.slug}`}
                        className="transition-opacity hover:opacity-60"
                      >
                        {update.title}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-4 opacity-52">
                      {update.summary}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 border-y border-[color:rgb(9_41_68_/_12%)] py-8 text-xs leading-5 opacity-50">
              첫 번째 AI Update를 준비하고 있습니다.
            </p>
          )}
        </div>

        <div className="border-t border-[color:rgb(9_41_68_/_14%)] py-5 lg:border-t-0 lg:pl-6">
          <div className="flex items-center justify-between">
            <SectionHeading>PRACTICE</SectionHeading>
            <span className="text-xs text-[var(--terracotta)]">더보기 →</span>
          </div>

          <div className="mt-3">
            {practiceStories.map((story) => (
              <article
                key={story.title}
                className="grid grid-cols-[minmax(112px,0.44fr)_minmax(0,0.56fr)] gap-4 border-t border-[color:rgb(9_41_68_/_12%)] py-4 first:border-t-0 first:pt-0"
              >
                <MockImage label="MOCK IMAGE" className="aspect-[16/9]" />
                <div className="self-center">
                  <h3 className="font-editorial text-base leading-snug font-semibold">
                    {story.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 opacity-62">
                    {story.description}
                  </p>
                  <p className="mt-1.5 text-[11px] opacity-48">{story.meta}</p>
                </div>
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
