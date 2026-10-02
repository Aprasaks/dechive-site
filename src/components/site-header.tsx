"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/knowledge", label: "Knowledge" },
  { href: "/ai-update", label: "AI Update" },
  { href: "/practice", label: "Practice" },
  { href: "/books", label: "Books" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isSnsSales = pathname.startsWith("/practice/sns-sales");

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 h-[var(--header-height)] text-[var(--navy)]">
      <div className="relative mx-auto flex h-full w-full max-w-[1440px] items-center px-5 sm:px-7 lg:px-10 xl:px-12">
        <Link
          href="/"
          className="text-sm font-bold tracking-[0.24em] sm:text-[15px]"
          aria-label="DECHIVE 홈"
        >
          DECHIVE
        </Link>

        {isSnsSales ? (
          <Link
            href="/practice/sns-sales"
            className="absolute left-1/2 -translate-x-1/2 text-[12px] font-semibold whitespace-nowrap sm:text-[13px]"
          >
            SNS판매자동화
          </Link>
        ) : (
          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex xl:gap-9"
            aria-label="주요 메뉴"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm whitespace-nowrap transition-opacity hover:opacity-60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <p className="font-handwriting ml-auto text-xl leading-none sm:text-[22px]">
          Humans verify
        </p>
      </div>
    </header>
  );
}
