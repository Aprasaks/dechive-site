export type Practice = {
  number: string;
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  difficulty: string;
  duration: string;
  highlights: readonly string[];
  detailHref: string;
  appHref: string;
  appLabel: string;
  status?: "NEW";
  version?: string;
};

export const practices: readonly Practice[] = [
  {
    number: "01",
    slug: "sns-automation",
    eyebrow: "INSTAGRAM · QUEUE AUTOMATION",
    title: "하나뿐인 상품을 파는 SNS 선착순 판매 자동화",
    description:
      "댓글 순서대로 구매권을 부여하고, 제한시간이 지나면 다음 순번으로 자동 승계하는 판매 시스템을 만듭니다.",
    image: "/images/practice-sns-queue.png",
    imageAlt: "Instagram 댓글 순번과 DM 결제 링크 자동화 흐름",
    difficulty: "중급",
    duration: "약 25분",
    highlights: ["게시물 등록", "댓글 트리거", "순번 자동 승계"],
    detailHref: "/practice/sns-automation",
    appHref: "/practice/sns-sales",
    appLabel: "프로그램 사용하기",
  },
  {
    number: "02",
    slug: "naver-publisher",
    eyebrow: "CONTENT · PUBLISHING STRUCTURE",
    title: "네이버 블로그 발행을 이런 구조로 만들어봤습니다",
    description:
      "완성된 원고와 이미지에서 시작해 구조 판별 → 네이버 미리보기 → SmartEditor 임시저장으로 이어지는 v1.0 구조를 기록합니다.",
    image: "/images/practice-naver-publisher.png",
    imageAlt: "블록으로 정리된 원고를 노트북에서 검토하는 모습",
    difficulty: "중급",
    duration: "약 20분",
    highlights: ["입력 · 구조 판별", "네이버 미리보기", "SmartEditor 연결"],
    detailHref: "/practice/naver-publisher",
    appHref: "/practice/naver-publisher/app",
    appLabel: "v1.0 화면 보기",
    status: "NEW",
    version: "v1.0",
  },
];

export function getPractice(slug: string) {
  return practices.find((practice) => practice.slug === slug);
}
