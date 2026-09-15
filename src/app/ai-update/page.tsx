import type { Metadata } from "next";

type MockImageProps = {
  label: string;
  className?: string;
};

const updateGroups = [
  {
    label: "TODAY",
    date: "2026.09.15",
    dateTime: "2026-09-15",
    updates: [
      {
        time: "09:30",
        dateTime: "2026-09-15T09:30:00+09:00",
        title: "OpenAI, 새로운 멀티모달 모델 발표",
        description:
          "텍스트, 이미지, 비디오, 오디오를 통합적으로 이해하는 차세대 멀티모달 모델을 공개했습니다.",
      },
      {
        time: "11:20",
        dateTime: "2026-09-15T11:20:00+09:00",
        title: "Google, Gemini 업데이트 공개",
        description:
          "멀티모달 이해 능력과 실시간 정보 검색 기능이 강화된 Gemini의 최신 버전을 발표했습니다.",
      },
      {
        time: "13:45",
        dateTime: "2026-09-15T13:45:00+09:00",
        title: "Anthropic, Claude 기능 확장",
        description:
          "문서 분석과 데이터 처리, 도구 사용 능력을 강화한 새로운 기능을 추가했습니다.",
      },
    ],
  },
  {
    label: "YESTERDAY",
    date: "2026.09.14",
    dateTime: "2026-09-14",
    updates: [
      {
        time: "18:20",
        dateTime: "2026-09-14T18:20:00+09:00",
        title: "AI 검색 서비스 경쟁 본격화",
        description:
          "주요 테크 기업들이 AI 기반 검색 서비스를 잇달아 업데이트하며 시장 경쟁이 본격화되고 있습니다.",
      },
      {
        time: "21:10",
        dateTime: "2026-09-14T21:10:00+09:00",
        title: "국내 AI 스타트업 투자 소식",
        description:
          "국내 AI 스타트업이 시리즈 B 투자를 유치하며 생성형 AI 기반 서비스 확장에 나섭니다.",
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "AI Update | DECHIVE",
  description: "매일 새롭게 등장하는 AI의 중요한 변화를 전하는 DECHIVE",
};

function MockImage({ label, className = "" }: MockImageProps) {
  return (
    <div
      className={`mock-image flex items-center justify-center ${className}`}
      role="img"
      aria-label={`${label} 이미지 준비 중`}
    >
      <span>{label}</span>
    </div>
  );
}

export default function AiUpdatePage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-4 pb-8 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_18%)] pb-5 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] lg:items-stretch lg:gap-10">
        <div className="flex flex-col justify-center py-4 lg:pr-3">
          <div className="flex items-center gap-4 text-[11px] tracking-[0.1em]">
            <span className="font-bold text-[var(--terracotta)]">
              AI UPDATE
            </span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <time className="opacity-52" dateTime="2026-09-15">
              2026.09.15
            </time>
          </div>

          <h1 className="font-editorial mt-4 text-[2.15rem] leading-[1.17] font-semibold tracking-[-0.045em] sm:text-[2.75rem] lg:text-[3rem]">
            오늘의 가장 중요한 AI 변화
          </h1>
          <p className="mt-4 max-w-xl text-[13px] leading-6 opacity-66 sm:text-sm">
            글로벌 빅테크의 새로운 멀티모달 모델과 AI 검색 서비스 경쟁이
            가속화되며, AI 생태계의 다음 단계가 더욱 선명해지고 있습니다.
          </p>
          <a
            href="#latest-updates"
            className="mt-5 w-fit border border-[var(--terracotta)] px-5 py-2.5 text-xs font-semibold text-[var(--terracotta)] transition-colors hover:bg-[var(--terracotta)] hover:text-[#fffaf2]"
          >
            자세히 보기 →
          </a>
        </div>

        <MockImage
          label="AI UPDATE FEATURED IMAGE"
          className="aspect-[16/8] lg:aspect-auto lg:min-h-[272px]"
        />
      </section>

      <section id="latest-updates" className="scroll-mt-16 pt-5">
        <h2 className="border-b border-[color:rgb(9_41_68_/_16%)] pb-3 text-sm font-bold tracking-[0.24em] sm:text-base">
          LATEST UPDATES
        </h2>

        <div>
          {updateGroups.map((group) => (
            <section key={group.date} className="pt-4">
              <h3 className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em]">
                <span>{group.label}</span>
                <span className="opacity-30">·</span>
                <time dateTime={group.dateTime}>{group.date}</time>
              </h3>

              <div className="mt-2 divide-y divide-[color:rgb(9_41_68_/_13%)] border-y border-[color:rgb(9_41_68_/_14%)]">
                {group.updates.map((update) => (
                  <article
                    key={update.title}
                    className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4 py-2.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-7"
                  >
                    <MockImage label="MOCK IMAGE" className="aspect-[16/6]" />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h4 className="font-editorial text-base leading-snug font-semibold sm:text-lg">
                          {update.title}
                        </h4>
                        <time
                          className="text-[10px] tracking-[0.05em] opacity-46"
                          dateTime={update.dateTime}
                        >
                          {update.time}
                        </time>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 opacity-58 sm:text-xs sm:leading-5">
                        {update.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
