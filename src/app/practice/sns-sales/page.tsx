import type { Metadata } from "next";

import { SnsSalesClient } from "./sns-sales-client";

export const metadata: Metadata = {
  title: "SNS판매자동화 | DECHIVE",
  description:
    "Instagram 콘텐츠 게시부터 댓글 트리거와 구매 순번까지 관리하는 DECHIVE Practice 프로그램",
};

export default function SnsSalesPage() {
  return <SnsSalesClient />;
}
