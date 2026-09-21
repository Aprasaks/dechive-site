import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { formatPublishedDate, readingTime } from "@/lib/knowledge";
import { getKnowledgePosts } from "@/sanity/lib/knowledge";
import { knowledgeImageUrl } from "@/sanity/lib/knowledge-image";
import type { KnowledgeSummary } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "Knowledge | DECHIVE",
  description: "질문하고 확인하며 쌓아가는 DECHIVE의 지식 아카이브",
};

function KnowledgeImage({
  post,
  priority = false,
}: {
  post: KnowledgeSummary;
  priority?: boolean;
}) {
  return (
    <Image
      src={knowledgeImageUrl(post.thumbnail, 1600, 900)}
      alt={post.thumbnail.alt}
      fill
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      sizes="(min-width: 1024px) 58vw, 100vw"
      className="object-cover"
    />
  );
}

function splitTitle(title: string) {
  const separator = " — ";
  const separatorIndex = title.indexOf(separator);

  if (separatorIndex === -1) {
    return { headline: title, subheading: null };
  }

  return {
    headline: title.slice(0, separatorIndex),
    subheading: title.slice(separatorIndex + separator.length),
  };
}

export default async function KnowledgePage() {
  const posts = await getKnowledgePosts();
  const [featured, ...latest] = posts;

  if (!featured) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-[1440px] items-center px-5 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--terracotta)]">
            KNOWLEDGE
          </p>
          <h1 className="font-editorial mt-4 text-4xl font-semibold">
            아직 발행된 글이 없습니다
          </h1>
          <p className="mt-4 text-sm opacity-60">
            Sanity에서 검증을 마친 글을 발행하면 이곳에 표시됩니다.
          </p>
        </div>
      </main>
    );
  }

  const { headline, subheading } = splitTitle(featured.title);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-4 pb-8 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_18%)] pb-6 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:items-stretch lg:gap-10">
        <div className="flex flex-col justify-center py-5 lg:pr-3">
          <div className="flex items-center gap-4 text-xs tracking-[0.08em]">
            <span className="font-bold text-[var(--terracotta)]">
              {featured.category?.toUpperCase() ?? "KNOWLEDGE"}
            </span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <time className="opacity-50" dateTime={featured.publishedAt}>
              {formatPublishedDate(featured.publishedAt)}
            </time>
          </div>

          <h1 className="font-editorial mt-5 break-keep">
            <span className="block text-[2rem] leading-[1.2] font-semibold tracking-[-0.035em] text-balance sm:text-[2.25rem] lg:text-[2.5rem]">
              {headline}
            </span>
            {subheading ? (
              <span className="mt-3 block text-xl leading-snug font-medium tracking-[-0.025em] opacity-68 sm:text-[1.4rem] lg:text-2xl">
                {subheading}
              </span>
            ) : null}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 opacity-68 sm:text-[15px]">
            {featured.summary}
          </p>
          <Link
            href={`/knowledge/${featured.slug}`}
            className="mt-7 w-fit border-b border-[var(--terracotta)] pb-1 text-sm font-semibold text-[var(--terracotta)] transition-opacity hover:opacity-60"
          >
            읽어보기 →
          </Link>
        </div>

        <Link
          href={`/knowledge/${featured.slug}`}
          className="relative block aspect-[16/9] overflow-hidden border border-[color:rgb(9_41_68_/_14%)] lg:aspect-auto lg:min-h-[290px]"
          aria-label={`${featured.title} 읽기`}
        >
          <KnowledgeImage post={featured} priority />
        </Link>
      </section>

      <section className="py-6">
        <h2 className="text-sm font-bold tracking-[0.24em] sm:text-base">
          LATEST KNOWLEDGE
        </h2>

        {latest.length > 0 ? (
          <div className="mt-4 divide-y divide-[color:rgb(9_41_68_/_14%)] border-y border-[color:rgb(9_41_68_/_16%)]">
            {latest.map((post) => (
              <article
                key={post._id}
                className="grid gap-4 py-5 sm:grid-cols-[minmax(180px,0.34fr)_minmax(0,0.66fr)] sm:items-center sm:gap-6 lg:grid-cols-[minmax(260px,0.3fr)_minmax(0,0.7fr)] lg:gap-8"
              >
                <Link
                  href={`/knowledge/${post.slug}`}
                  className="relative block aspect-[16/7] overflow-hidden border border-[color:rgb(9_41_68_/_14%)] sm:aspect-[16/6]"
                  aria-label={`${post.title} 읽기`}
                >
                  <KnowledgeImage post={post} />
                </Link>

                <div className="min-w-0">
                  <div className="flex items-center gap-3 text-[11px] tracking-[0.06em]">
                    <span className="font-bold text-[var(--terracotta)]">
                      {post.category?.toUpperCase() ?? "KNOWLEDGE"}
                    </span>
                    <span className="h-px w-4 bg-[var(--terracotta)] opacity-60" />
                    <time className="opacity-48" dateTime={post.publishedAt}>
                      {formatPublishedDate(post.publishedAt)}
                    </time>
                  </div>
                  <h3 className="font-editorial mt-2 text-xl leading-snug font-semibold sm:text-[1.35rem]">
                    <Link
                      href={`/knowledge/${post.slug}`}
                      className="transition-opacity hover:opacity-60"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-1.5 max-w-3xl text-xs leading-5 opacity-62 sm:text-[13px]">
                    {post.summary}
                  </p>
                  <p className="mt-2 text-[11px] opacity-48">
                    {readingTime(post.bodyText)} min read
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 border-y border-[color:rgb(9_41_68_/_16%)] py-8 text-sm opacity-55">
            다음 Knowledge 글을 준비하고 있습니다.
          </p>
        )}
      </section>
    </main>
  );
}
