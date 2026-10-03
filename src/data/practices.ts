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
    eyebrow: "CONTENT · HUMAN REVIEW",
    title: "이미 쓴 글을 다시 편집하지 않는 NAVER PUBLISHER",
    description:
      "완성된 원고를 블로그용 문단·소제목·인용구·이미지 구조로 정리하고, 사람이 확인한 뒤 네이버 임시저장으로 연결합니다.",
    image: "/images/practice-naver-publisher.png",
    imageAlt: "블록으로 정리된 원고를 노트북에서 검토하는 모습",
    difficulty: "중급",
    duration: "약 20분",
    highlights: ["원고 구조화", "네이버형 미리보기", "임시저장"],
    detailHref: "/practice/naver-publisher",
    appHref: "/practice/naver-publisher/app",
    appLabel: "무료로 사용하기",
    status: "NEW",
    version: "v1.0",
  },
];

export function getPractice(slug: string) {
  return practices.find((practice) => practice.slug === slug);
}
