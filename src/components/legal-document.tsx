import type { ReactNode } from "react";

type LegalSection = {
  id: string;
  number: string;
  title: string;
  content: ReactNode;
};

type RelatedLink = {
  label: string;
  href: string;
  external?: boolean;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  englishTitle: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
  relatedLinks?: RelatedLink[];
};

export function LegalDocument({
  eyebrow,
  title,
  englishTitle,
  description,
  effectiveDate,
  sections,
  relatedLinks = [],
}: LegalDocumentProps) {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-4 pb-8 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-7 border-b border-[color:rgb(9_41_68_/_18%)] py-7 lg:grid-cols-[minmax(0,0.64fr)_minmax(280px,0.36fr)] lg:items-end lg:gap-12 lg:py-10">
        <div>
          <div className="flex items-center gap-4 text-[11px] tracking-[0.12em]">
            <span className="font-bold text-[var(--terracotta)]">
              {eyebrow}
            </span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <span className="opacity-52">DECHIVE</span>
          </div>
          <h1 className="font-editorial mt-5 text-[2.3rem] leading-[1.15] font-semibold tracking-[-0.045em] sm:text-5xl lg:text-[3.15rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 opacity-68 sm:text-[15px]">
            {description}
          </p>
          <p className="mt-5 text-[11px] tracking-[0.06em] opacity-50">
            시행일 {effectiveDate}
          </p>
        </div>

        <div className="border-l border-[color:rgb(9_41_68_/_20%)] pl-6 lg:pb-1">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--terracotta)]">
            LEGAL DOCUMENT
          </p>
          <p className="font-editorial mt-3 text-2xl leading-tight font-semibold sm:text-3xl">
            {englishTitle}
          </p>
          <p className="mt-4 max-w-xs text-xs leading-5 opacity-56">
            읽기 쉽고 명확한 언어로 이용자와 서비스의 기준을 설명합니다.
          </p>
        </div>
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_290px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="lg:pr-9 xl:pr-12">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-20 border-b border-[color:rgb(9_41_68_/_14%)] py-6 last:border-b-0"
            >
              <div className="grid gap-3 sm:grid-cols-[38px_minmax(0,1fr)] sm:gap-5">
                <span className="font-editorial text-sm opacity-48">
                  {section.number}
                </span>
                <div>
                  <h2 className="font-editorial text-xl font-semibold sm:text-[1.35rem]">
                    {section.title}
                  </h2>
                  <div className="legal-copy mt-3 space-y-3 text-xs leading-6 opacity-68 sm:text-[13px]">
                    {section.content}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </article>

        <aside className="border-t border-[color:rgb(9_41_68_/_14%)] py-6 lg:border-t-0 lg:border-l lg:pl-7 xl:pl-8">
          <div className="lg:sticky lg:top-[calc(var(--header-height)+24px)]">
            <h2 className="font-editorial text-lg font-semibold">문서 목차</h2>
            <ol className="mt-3 divide-y divide-[color:rgb(9_41_68_/_11%)] border-y border-[color:rgb(9_41_68_/_13%)]">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="grid grid-cols-[26px_minmax(0,1fr)] gap-2 py-2.5 text-[11px] leading-4 transition-colors hover:text-[var(--terracotta)]"
                  >
                    <span className="font-editorial opacity-44">
                      {section.number}
                    </span>
                    <span>{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>

            {relatedLinks.length > 0 ? (
              <section className="mt-6">
                <h2 className="font-editorial text-lg font-semibold">
                  관련 안내
                </h2>
                <div className="mt-3 space-y-2">
                  {relatedLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noreferrer" : undefined}
                      className="flex items-center justify-between border-b border-[color:rgb(9_41_68_/_12%)] py-2 text-[11px] transition-colors hover:text-[var(--terracotta)]"
                    >
                      <span>{link.label}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <blockquote className="mt-6 border border-[color:rgb(9_41_68_/_12%)] px-5 py-5 text-center">
              <p className="font-editorial text-sm leading-6 text-[var(--terracotta)]">
                AI creates,
                <br />
                Humans verify.
              </p>
              <footer className="mt-3 text-[9px] tracking-[0.18em] opacity-48">
                — DECHIVE
              </footer>
            </blockquote>
          </div>
        </aside>
      </div>
    </main>
  );
}
