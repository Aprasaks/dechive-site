import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { handwriting } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "DECHIVE",
  description: "DECHIVE",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={handwriting.variable}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
