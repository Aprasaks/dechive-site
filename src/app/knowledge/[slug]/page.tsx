import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KnowledgeBody } from "@/components/knowledge-body";
import { formatPublishedDate, readingTime } from "@/lib/knowledge";
import { getKnowledgePost, getKnowledgePosts } from "@/sanity/lib/knowledge";
import { knowledgeImageUrl } from "@/sanity/lib/knowledge-image";

type KnowledgePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getKnowledgePosts();

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: KnowledgePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getKnowledgePost(slug);

  if (!post) {
    return {};
  }

  const image = knowledgeImageUrl(post.thumbnail, 1200, 630);

  return {
    title: `${post.title} | DECHIVE`,
    description: post.summary,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt,
      images: [{ url: image, alt: post.thumbnail.alt }],
    },
  };
}

export default async function KnowledgeDetailPage({
  params,
}: KnowledgePageProps) {
  const { slug } = await params;
  const post = await getKnowledgePost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-[1240px] px-5 pt-7 pb-16 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <article>
        <header className="grid gap-7 border-b border-[color:rgb(9_41_68_/_18%)] pb-8 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] lg:items-center lg:gap-12">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs tracking-[0.07em]">
              <span className="font-bold text-[var(--terracotta)]">
                {post.category?.toUpperCase() ?? "KNOWLEDGE"}
              </span>
              <span className="h-px w-5 bg-[var(--terracotta)]" />
              <time className="opacity-50" dateTime={post.publishedAt}>
                {formatPublishedDate(post.publishedAt)}
              </time>
              <span className="opacity-30">·</span>
              <span className="opacity-50">
                {readingTime(post.bodyText)} min read
              </span>
            </div>

            <h1 className="font-editorial mt-5 text-[2.45rem] leading-[1.14] font-semibold tracking-[-0.045em] sm:text-5xl lg:text-[3.5rem]">
              {post.title}
            </h1>
            <p className="mt-5 text-sm leading-7 opacity-68 sm:text-[15px]">
              {post.summary}
            </p>
          </div>

          <figure>
            <div className="relative aspect-[16/9] overflow-hidden border border-[color:rgb(9_41_68_/_14%)]">
              <Image
                src={knowledgeImageUrl(post.thumbnail, 1600, 900)}
                alt={post.thumbnail.alt}
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover"
              />
            </div>
            {post.thumbnail.caption ? (
              <figcaption className="mt-2 text-xs leading-5 opacity-50">
                {post.thumbnail.caption}
              </figcaption>
            ) : null}
          </figure>
        </header>

        <div className="mx-auto max-w-[760px] pt-10 sm:pt-14">
          <KnowledgeBody value={post.body} />

          {post.keywords.length > 0 ? (
            <footer className="mt-14 border-t border-[color:rgb(9_41_68_/_16%)] pt-6">
              <p className="text-[11px] font-bold tracking-[0.18em] opacity-55">
                KEYWORDS
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {post.keywords.map((keyword) => (
                  <li
                    key={keyword}
                    className="border border-[color:rgb(9_41_68_/_18%)] px-3 py-1.5 text-xs"
                  >
                    {keyword}
                  </li>
                ))}
              </ul>
            </footer>
          ) : null}

          <Link
            href="/knowledge"
            className="mt-10 inline-block border-b border-[var(--terracotta)] pb-1 text-sm font-semibold text-[var(--terracotta)] transition-opacity hover:opacity-60"
          >
            ← Knowledge 목록
          </Link>
        </div>
      </article>
    </main>
  );
}
