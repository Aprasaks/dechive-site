import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DECHIVE",
  description: "DECHIVE",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
