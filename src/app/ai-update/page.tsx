import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  formatUpdateDate,
  formatUpdateTime,
  groupAiUpdates,
} from "@/lib/ai-update";
import { getAiUpdates } from "@/sanity/lib/ai-update";
import { knowledgeImageUrl } from "@/sanity/lib/knowledge-image";
import type { AiUpdateSummary } from "@/sanity/lib/types";

export const metadata: Metadata = {
  title: "AI Update | DECHIVE",
  description:
    "중요한 AI 업데이트와 그 변화가 만드는 실제 가능성을 설명하는 DECHIVE",
};

// Keep the published list fresh even when no Sanity Live session is open.
export const revalidate = 60;

function UpdateImage({
  update,
  priority = false,
}: {
  update: AiUpdateSummary;
  priority?: boolean;
}) {
  return (
    <Image
      src={knowledgeImageUrl(update.thumbnail, 1600, 900)}
      alt={update.thumbnail.alt}
      fill
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      sizes="(min-width: 1024px) 57vw, 100vw"
      className="object-cover"
    />
  );
}

export default async function AiUpdatePage() {
  const updates = await getAiUpdates();
  const featured = updates[0];
  const groups = groupAiUpdates(updates);

  if (!featured) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-[1440px] items-center px-5 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--terracotta)]">
            AI UPDATE
          </p>
          <h1 className="font-editorial mt-4 text-4xl font-semibold">
            첫 번째 AI Update를 준비하고 있습니다
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 opacity-60">
            중요한 변화가 무엇인지, 그리고 그 변화로 무엇을 할 수 있는지 확인해
            전하겠습니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-4 pb-8 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_18%)] pb-5 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:items-stretch lg:gap-10">
        <div className="flex flex-col justify-center py-4 lg:pr-3">
          <div className="flex items-center gap-4 text-[11px] tracking-[0.1em]">
            <span className="font-bold text-[var(--terracotta)]">
              AI UPDATE
            </span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <time className="opacity-52" dateTime={featured.publishedAt}>
              {formatUpdateDate(featured.publishedAt)}
            </time>
          </div>

          <h1 className="font-editorial mt-4 text-[2.15rem] leading-[1.17] font-semibold tracking-[-0.045em] sm:text-[2.75rem] lg:text-[3rem]">
            {featured.title}
          </h1>
          <p className="mt-4 max-w-xl text-[13px] leading-6 opacity-66 sm:text-sm">
            {featured.summary}
          </p>
          <Link
            href={`/ai-update/${featured.slug}`}
            className="mt-5 w-fit border border-[var(--terracotta)] px-5 py-2.5 text-xs font-semibold text-[var(--terracotta)] transition-colors hover:bg-[var(--terracotta)] hover:text-[#fffaf2]"
          >
            자세히 보기 →
          </Link>
        </div>

        <Link
          href={`/ai-update/${featured.slug}`}
          className="relative block aspect-[16/8] overflow-hidden border border-[color:rgb(9_41_68_/_14%)] lg:aspect-auto lg:min-h-[272px]"
          aria-label={`${featured.title} 자세히 보기`}
        >
          <UpdateImage update={featured} priority />
        </Link>
      </section>

      <section id="latest-updates" className="scroll-mt-16 pt-5">
        <h2 className="border-b border-[color:rgb(9_41_68_/_16%)] pb-3 text-sm font-bold tracking-[0.24em] sm:text-base">
          LATEST UPDATES
        </h2>

        <div>
          {groups.map((group) => (
            <section key={group.key} className="pt-4">
              <h3 className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em]">
                <span>{group.label}</span>
                <span className="opacity-30">·</span>
                <time dateTime={group.key}>{group.date}</time>
              </h3>

              <div className="mt-2 divide-y divide-[color:rgb(9_41_68_/_13%)] border-y border-[color:rgb(9_41_68_/_14%)]">
                {group.items.map((update) => (
                  <article
                    key={update._id}
                    className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4 py-2.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-7"
                  >
                    <Link
                      href={`/ai-update/${update.slug}`}
                      className="relative block aspect-[16/7] overflow-hidden border border-[color:rgb(9_41_68_/_14%)]"
                      aria-label={`${update.title} 자세히 보기`}
                    >
                      <UpdateImage update={update} />
                    </Link>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h4 className="font-editorial text-base leading-snug font-semibold sm:text-lg">
                          <Link
                            href={`/ai-update/${update.slug}`}
                            className="transition-opacity hover:opacity-60"
                          >
                            {update.title}
                          </Link>
                        </h4>
                        <time
                          className="text-[10px] tracking-[0.05em] opacity-46"
                          dateTime={update.publishedAt}
                        >
                          {formatUpdateTime(update.publishedAt)}
                        </time>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 opacity-58 sm:text-xs sm:leading-5">
                        {update.summary}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
