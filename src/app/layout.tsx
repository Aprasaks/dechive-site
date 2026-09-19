import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { body, editorial, handwriting } from "@/lib/fonts";
import { SanityLive } from "@/sanity/lib/live";

import "./globals.css";

export const metadata: Metadata = {
  title: "DECHIVE",
  description: "DECHIVE",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${body.variable} ${editorial.variable} ${handwriting.variable}`}
    >
      <body>
        <SiteHeader />
        <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
        <SanityLive />
      </body>
    </html>
  );
}
