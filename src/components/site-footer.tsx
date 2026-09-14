import Link from "next/link";

const footerNavigation = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:rgb(9_41_68_/_12%)] text-[var(--navy)]">
      <div className="mx-auto flex min-h-16 w-full max-w-[1440px] flex-col justify-center gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10 xl:px-12">
        <div className="leading-none">
          <Link
            href="/"
            className="text-[13px] font-bold tracking-[0.2em]"
            aria-label="DECHIVE 홈"
          >
            DECHIVE
          </Link>
          <p className="mt-1.5 text-[11px] tracking-[0.04em] opacity-60">
            AI creates, Humans verify
          </p>
        </div>

        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs"
          aria-label="푸터 메뉴"
        >
          {footerNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-opacity hover:opacity-60"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
