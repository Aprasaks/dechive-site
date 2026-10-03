import type { Metadata } from "next";
import Link from "next/link";

import { NaverPublisherClient } from "../naver-publisher-client";

export const metadata: Metadata = {
  title: "NAVER PUBLISHER v1.0 | DECHIVE",
  description:
    "원고를 정리하고 미리보기한 뒤 네이버 블로그 임시저장으로 보내는 DECHIVE NAVER PUBLISHER",
};

export default function NaverPublisherAppPage() {
  return (
    <main className="mx-auto w-full max-w-[1560px] px-4 pt-4 pb-10 text-[var(--navy)] sm:px-6 lg:px-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[color:rgb(9_41_68_/_14%)] pb-4">
        <div>
          <Link
            href="/practice/naver-publisher"
            className="text-[11px] font-semibold transition-colors hover:text-[var(--terracotta)]"
          >
            ← DECHIVE로 돌아가기
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <p className="font-editorial text-2xl font-semibold">NAVER PUBLISHER</p>
            <span className="border border-[var(--terracotta)] px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-[var(--terracotta)]">
              v1.0
            </span>
          </div>
        </div>
        <p className="text-[12px] font-medium">
          원고 붙여넣기 → 네이버 미리보기 → 임시저장
        </p>
      </header>

      <NaverPublisherClient />
    </main>
  );
}
