import type { Metadata } from "next";
import { NaverPublisherClient } from "../naver-publisher-client";

export const metadata: Metadata = {
  title: "NAVER PUBLISHER v1.0 | DECHIVE",
  description:
    "원고를 정리하고 미리보기한 뒤 네이버 블로그 임시저장으로 보내는 DECHIVE NAVER PUBLISHER",
};

export default function NaverPublisherAppPage() {
  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 pt-5 pb-10 text-[var(--navy)] sm:px-6 lg:px-8">
      <NaverPublisherClient />
    </main>
  );
}
