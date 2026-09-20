import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AiUpdateBody } from "@/components/ai-update-body";
import { formatUpdateDate, formatUpdateTime } from "@/lib/ai-update";
import { readingTime } from "@/lib/knowledge";
import { getAiUpdate, getAiUpdates } from "@/sanity/lib/ai-update";
import { knowledgeImageUrl } from "@/sanity/lib/knowledge-image";

type AiUpdatePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const updates = await getAiUpdates();

  return updates.map((update) => ({ slug: update.slug }));
}

export async function generateMetadata({
  params,
}: AiUpdatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const update = await getAiUpdate(slug);

  if (!update) return {};

  const image = knowledgeImageUrl(update.thumbnail, 1200, 630);

  return {
    title: `${update.title} | DECHIVE`,
    description: update.summary,
    alternates: { canonical: `/ai-update/${update.slug}` },
    openGraph: {
      type: "article",
      title: update.title,
      description: update.summary,
      publishedTime: update.publishedAt,
      images: [{ url: image, alt: update.thumbnail.alt }],
    },
  };
}

export default async function AiUpdateDetailPage({
  params,
}: AiUpdatePageProps) {
  const { slug } = await params;
  const update = await getAiUpdate(slug);

  if (!update) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: update.title,
    description: update.summary,
    datePublished: update.publishedAt,
    dateModified: update.publishedAt,
    image: knowledgeImageUrl(update.thumbnail, 1200, 630),
    mainEntityOfPage: `https://dechive.dev/ai-update/${update.slug}`,
    isBasedOn: update.officialLink,
    author: { "@type": "Organization", name: "DECHIVE" },
    publisher: { "@type": "Organization", name: "DECHIVE" },
  };

  return (
    <main className="mx-auto w-full max-w-[1240px] px-5 pt-7 pb-16 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        <header className="grid gap-7 border-b border-[color:rgb(9_41_68_/_18%)] pb-8 lg:grid-cols-[minmax(0,0.49fr)_minmax(0,0.51fr)] lg:items-center lg:gap-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs tracking-[0.07em]">
              <span className="font-bold text-[var(--terracotta)]">
                AI UPDATE
              </span>
              <span className="h-px w-5 bg-[var(--terracotta)]" />
              <time className="opacity-50" dateTime={update.publishedAt}>
                {formatUpdateDate(update.publishedAt)} ·{" "}
                {formatUpdateTime(update.publishedAt)}
              </time>
              <span className="opacity-30">·</span>
              <span className="opacity-50">
                {readingTime(update.bodyText)} min read
              </span>
            </div>

            <h1 className="font-editorial mt-5 text-[2.45rem] leading-[1.14] font-semibold tracking-[-0.045em] sm:text-5xl lg:text-[3rem] lg:whitespace-nowrap">
              {update.title}
            </h1>
            <p className="mt-5 text-sm leading-7 opacity-68 sm:text-[15px]">
              {update.summary}
            </p>
          </div>

          <figure>
            <div className="relative aspect-[16/9] overflow-hidden border border-[color:rgb(9_41_68_/_14%)]">
              <Image
                src={knowledgeImageUrl(update.thumbnail, 1600, 900)}
                alt={update.thumbnail.alt}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover"
              />
            </div>
            {update.thumbnail.caption ? (
              <figcaption className="mt-2 text-xs leading-5 opacity-50">
                {update.thumbnail.caption}
              </figcaption>
            ) : null}
          </figure>
        </header>

        <div className="mx-auto max-w-[800px] pt-10 sm:pt-14">
          <section aria-labelledby="update-detail-heading">
            <h2
              id="update-detail-heading"
              className="mb-6 text-xs font-bold tracking-[0.2em] text-[var(--terracotta)]"
            >
              UPDATE DETAIL
            </h2>
            <AiUpdateBody value={update.body} />
          </section>

          <section className="mt-14 border-t border-[color:rgb(9_41_68_/_16%)] pt-8">
            <p className="text-xs font-bold tracking-[0.2em] text-[var(--terracotta)]">
              WHAT CHANGED
            </p>
            <h2 className="font-editorial mt-3 mb-6 text-3xl font-semibold tracking-[-0.025em]">
              무엇이 바뀌는가
            </h2>
            <AiUpdateBody value={update.changes} />
          </section>

          <section className="mt-14 border-y border-[var(--terracotta)] bg-[color:rgb(185_79_44_/_5%)] px-5 py-8 sm:px-8">
            <p className="text-xs font-bold tracking-[0.2em] text-[var(--terracotta)]">
              WHAT WE CAN DO
            </p>
            <h2 className="font-editorial mt-3 mb-6 text-3xl font-semibold tracking-[-0.025em]">
              이 변화로 무엇을 할 수 있는가
            </h2>
            <AiUpdateBody value={update.possibilities} />
          </section>

          <aside className="mt-10 flex flex-col gap-4 border border-[color:rgb(9_41_68_/_16%)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] opacity-50">
                OFFICIAL LINK
              </p>
              <p className="mt-1 text-sm opacity-65">
                원문과 세부 정보는 공식 발표에서 확인할 수 있습니다.
              </p>
            </div>
            <a
              href={update.officialLink}
              target="_blank"
              rel="noreferrer noopener"
              className="shrink-0 border-b border-[var(--terracotta)] pb-1 text-sm font-semibold text-[var(--terracotta)] transition-opacity hover:opacity-60"
            >
              {update.officialLinkLabel} ↗
            </a>
          </aside>

          <Link
            href="/ai-update"
            className="mt-10 inline-block border-b border-[var(--terracotta)] pb-1 text-sm font-semibold text-[var(--terracotta)] transition-opacity hover:opacity-60"
          >
            ← AI Update 목록
          </Link>
        </div>
      </article>
    </main>
  );
}
