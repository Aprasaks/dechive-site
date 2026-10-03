import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { practices } from "@/data/practices";

export const metadata: Metadata = {
  title: "Practice | DECHIVE",
  description:
    "직접 만들고 구조를 이해하는 DECHIVE 실전 프로젝트를 살펴보세요.",
};

export default function PracticeIndexPage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-5 pb-12 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-7 border-b border-[color:rgb(9_41_68_/_16%)] py-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(300px,0.32fr)] lg:items-end lg:py-12">
        <div>
          <div className="flex items-center gap-3 text-[11px] tracking-[0.1em]">
            <span className="font-bold text-[var(--terracotta)]">PRACTICE</span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <span className="opacity-50">HANDS-ON SERIES</span>
          </div>
          <h1 className="font-editorial mt-5 text-[2.4rem] leading-[1.12] font-semibold tracking-[-0.05em] sm:text-5xl lg:text-[3.25rem]">
            직접 만들고,
            <br />
            구조를 이해합니다.
          </h1>
        </div>
        <p className="max-w-md text-sm leading-7 opacity-62 lg:pb-1">
          완성된 코드를 따라 치는 실습이 아닙니다. 어떤 문제를 어떤 구조로
          해결하는지 먼저 이해하고, 실제 프로그램으로 검증합니다.
        </p>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-[color:rgb(9_41_68_/_14%)] pb-4">
          <div>
            <p className="text-[10px] tracking-[0.14em] text-[var(--terracotta)]">
              ALL PROJECTS
            </p>
            <h2 className="font-editorial mt-2 text-2xl font-semibold">
              현재 진행할 수 있는 실습
            </h2>
          </div>
          <p className="font-editorial text-sm opacity-45">
            {String(practices.length).padStart(2, "0")} projects
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {practices.map((practice, index) => (
            <article
              key={practice.slug}
              className="group flex h-full flex-col overflow-hidden border border-[color:rgb(9_41_68_/_12%)] bg-[color:rgb(255_255_255_/_18%)]"
            >
              <Link
                href={practice.detailHref}
                className="relative block aspect-[16/9] overflow-hidden bg-[#e9dfd0]"
              >
                <Image
                  src={practice.image}
                  alt={practice.imageAlt}
                  fill
                  preload={index === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                  <span className="font-editorial flex size-11 items-center justify-center bg-[#fffaf2] text-sm font-semibold text-[var(--terracotta)] shadow-sm">
                    {practice.number}
                  </span>
                  <div className="flex items-center gap-2">
                    {practice.version ? (
                      <span className="border border-[var(--terracotta)] bg-[#fffaf2] px-2.5 py-1.5 text-[9px] font-bold tracking-[0.12em] text-[var(--terracotta)]">
                        {practice.version}
                      </span>
                    ) : null}
                    {practice.status ? (
                      <span className="bg-[var(--terracotta)] px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] text-[#fffaf2]">
                        {practice.status}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-[9px] tracking-[0.13em] text-[var(--terracotta)]">
                  {practice.eyebrow}
                </p>
                <h3 className="font-editorial mt-3 text-xl leading-snug font-semibold sm:text-[1.35rem]">
                  <Link
                    href={practice.detailHref}
                    className="transition-opacity hover:opacity-65"
                  >
                    {practice.title}
                  </Link>
                </h3>
                <p className="mt-3 text-xs leading-6 opacity-62">
                  {practice.description}
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {practice.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="border border-[color:rgb(9_41_68_/_12%)] px-2.5 py-1.5 text-[10px] opacity-65"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                  <Link
                    href={practice.detailHref}
                    className="inline-flex h-9 items-center bg-[var(--navy)] px-4 text-[11px] font-semibold text-[#fffaf2] transition-opacity hover:opacity-85"
                  >
                    실습 살펴보기 →
                  </Link>
                  <Link
                    href={practice.appHref}
                    className="inline-flex h-9 items-center border border-[var(--terracotta)] px-4 text-[11px] font-semibold text-[var(--terracotta)] transition-colors hover:bg-[var(--terracotta)] hover:text-[#fffaf2]"
                  >
                    {practice.appLabel} →
                  </Link>
                  <span className="ml-auto text-[10px] opacity-45">
                    {practice.difficulty} · {practice.duration}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
