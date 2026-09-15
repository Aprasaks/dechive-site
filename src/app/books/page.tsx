import type { Metadata } from "next";
import Image from "next/image";

const bookCover =
  "https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/480D260993540.jpg";
const bookCoverThumbnail =
  "https://contents.kyobobook.co.kr/sih/fit-in/150x0/pdt/480D260993540.jpg";

const bookstores = [
  {
    label: "리디북스",
    href: "https://ridibooks.com/books/1745011781",
  },
  {
    label: "교보ebook",
    href: "https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013551259",
  },
  {
    label: "예스24",
    href: "https://www.yes24.com/product/goods/196268816",
  },
  {
    label: "알라딘",
    href: "https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=All&SearchWord=9791139063158",
  },
];

const keyMessages = [
  {
    number: "01",
    title: "좋은 질문이 좋은 제품을 만든다",
    description: "아이디어보다 중요한 것은 올바른 질문을 던지는 능력입니다.",
  },
  {
    number: "02",
    title: "작게 시작하고 빠르게 검증하라",
    description: "완벽한 계획보다 빠른 실행이 더 나은 답을 가져다줍니다.",
  },
  {
    number: "03",
    title: "고객의 문제에서 출발하라",
    description: "만들고 싶은 것이 아니라 실제로 필요한 것을 들여다봅니다.",
  },
  {
    number: "04",
    title: "데이터와 피드백이 감정을 이긴다",
    description:
      "의견이 아니라 반복된 검증을 통해 더 좋은 제품이 만들어집니다.",
  },
];

const readers = [
  {
    number: "01",
    title: "1인 빌더와 바이브코더",
    description: "만들기 전에 무엇을 검증할지 알고 싶은 분",
  },
  {
    number: "02",
    title: "AI 제품을 만드는 실무자",
    description: "더 나은 의사결정을 위한 검증 흐름이 필요한 분",
  },
  {
    number: "03",
    title: "검증 가능한 시작을 원하는 사람",
    description: "일과 삶의 다양한 영역에서 실패를 줄이고 싶은 분",
  },
];

const upcomingBooks = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  title: "준비 중",
  description: "곧 새로운 책을 만나보실 수 있습니다.",
}));

export const metadata: Metadata = {
  title: "Books | DECHIVE",
  description:
    "만들기 전에 검증하라 — 바이브코딩 시대의 1인 빌더를 위한 검증 안내서",
};

function NumberedHeading({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-editorial text-sm opacity-55">{number}</span>
      <h2 className="font-editorial text-lg font-semibold sm:text-xl">
        {children}
      </h2>
    </div>
  );
}

function BookHeroVisual() {
  return (
    <div className="relative isolate min-h-[310px] overflow-hidden border border-[color:rgb(9_41_68_/_12%)] bg-[#e8ddc9] sm:min-h-[360px] lg:min-h-[310px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgb(255_255_255_/_80%),transparent_32%),linear-gradient(115deg,transparent_48%,rgb(78_49_24_/_8%))]" />
      <div className="absolute -top-12 -left-8 size-52 rounded-full bg-[color:rgb(70_95_56_/_22%)] blur-xl" />
      <div className="font-editorial absolute right-[8%] bottom-7 hidden w-36 border-l border-[color:rgb(9_41_68_/_22%)] pl-5 text-lg leading-7 sm:block">
        좋은 질문이
        <br />더 나은 시작을
        <br />
        만든다.
        <span className="mt-3 block text-[9px] tracking-[0.2em] opacity-55">
          — DECHIVE
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-[linear-gradient(180deg,transparent,rgb(105_68_36_/_16%))]" />
      <div className="absolute top-1/2 left-[45%] h-[84%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_18px_22px_rgb(58_36_18_/_22%)] sm:left-[43%] lg:left-[42%]">
        <Image
          src={bookCover}
          alt="만들기전에 검증하라 표지"
          width={458}
          height={641}
          sizes="(max-width: 1024px) 260px, 250px"
          loading="eager"
          className="h-full w-auto border border-[color:rgb(127_92_43_/_18%)] object-contain"
        />
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-3 pb-8 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-6 border-b border-[color:rgb(9_41_68_/_18%)] pb-4 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-stretch lg:gap-9">
        <div className="flex flex-col justify-center py-4 lg:pr-3">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.08em]">
            <span className="font-bold text-[var(--terracotta)]">BOOKS</span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <span className="opacity-52">EDITOR&apos;S PICK</span>
          </div>

          <h1 className="font-editorial mt-4 text-[2.15rem] leading-[1.16] font-semibold tracking-[-0.045em] sm:text-[2.7rem] lg:text-[2.9rem] lg:whitespace-nowrap">
            만들기전에 검증하라
          </h1>
          <p className="font-editorial mt-2 text-lg opacity-82 sm:text-xl">
            바이브코딩, 1인기업, AI SaaS의 착각들
          </p>
          <p className="mt-4 max-w-xl text-[13px] leading-6 opacity-66 sm:text-sm">
            좋은 아이디어는 만드는 것에서 끝나지 않습니다. 시간과 노력을 쏟기
            전에 정말 필요한지, 방향이 맞는지, 팔릴 수 있는지를 먼저 검증하는
            구체적인 방법을 안내합니다.
          </p>
          <p className="mt-3 text-[11px] tracking-[0.02em] opacity-52 sm:text-xs">
            윤강혁 · e퍼플 · 2026.09.04 · PDF 155쪽
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <strong className="text-sm font-semibold">책 구경가기</strong>
            <div className="flex flex-wrap gap-2">
              {bookstores.map((store) => (
                <a
                  key={store.label}
                  href={store.href}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-[color:rgb(9_41_68_/_25%)] px-3 py-2 text-[11px] font-semibold transition-colors hover:border-[var(--terracotta)] hover:text-[var(--terracotta)]"
                >
                  {store.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <BookHeroVisual />
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="lg:pr-7 xl:pr-8">
          <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-4">
            <NumberedHeading number="01">이 책은 어떤 책인가</NumberedHeading>
            <div className="mt-3 space-y-2 text-xs leading-5.5 opacity-66 sm:pl-9 sm:text-[13px]">
              <p>
                『만들기전에 검증하라』는 바이브코딩 시대에 혼자 제품을 만드는
                1인 빌더를 위한 검증 안내서입니다. AI가 무엇이든 빠르게
                만들어주는 시대일수록, 무엇을 만들 것인가보다 무엇을 검증할
                것인가가 중요합니다.
              </p>
              <p>
                아이디어를 코드로 옮기기 전부터 출시 이후까지, 반드시 물어야 할
                질문과 확인해야 할 신호를 45개의 짧은 챕터와 DECHIVE
                CHECKPOINT로 정리했습니다.
              </p>
            </div>
          </section>

          <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-4">
            <NumberedHeading number="02">핵심 메시지</NumberedHeading>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {keyMessages.map((message) => (
                <article
                  key={message.number}
                  className="border border-[color:rgb(9_41_68_/_10%)] bg-[color:rgb(255_255_255_/_16%)] p-3"
                >
                  <span className="font-editorial text-sm font-semibold text-[var(--terracotta)]">
                    {message.number}
                  </span>
                  <h3 className="font-editorial mt-2 text-sm leading-snug font-semibold">
                    {message.title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-4 opacity-56">
                    {message.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-4">
            <NumberedHeading number="03">이런 분께 추천합니다</NumberedHeading>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {readers.map((reader) => (
                <article
                  key={reader.number}
                  className="grid grid-cols-[30px_minmax(0,1fr)] gap-3 border border-[color:rgb(9_41_68_/_10%)] bg-[color:rgb(255_255_255_/_16%)] p-3"
                >
                  <span className="font-editorial text-sm font-semibold text-[var(--terracotta)]">
                    {reader.number}
                  </span>
                  <div>
                    <h3 className="font-editorial text-sm leading-snug font-semibold">
                      {reader.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-4 opacity-56">
                      {reader.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="py-4">
            <NumberedHeading number="04">기억에 남는 문장</NumberedHeading>
            <blockquote className="mt-3 border-y border-[color:rgb(9_41_68_/_10%)] px-4 py-4 sm:ml-9 sm:flex sm:items-center sm:justify-between sm:gap-5">
              <p className="font-editorial text-base leading-7 text-[var(--terracotta)] sm:text-lg">
                “AI는 만들어준다. 팔리는지는 말해주지 않는다.”
              </p>
              <footer className="mt-2 text-[10px] tracking-[0.12em] opacity-50 sm:mt-0 sm:whitespace-nowrap">
                — 만들기전에 검증하라
              </footer>
            </blockquote>
          </section>
        </div>

        <aside className="border-t border-[color:rgb(9_41_68_/_14%)] py-5 lg:border-t-0 lg:border-l lg:pl-7 xl:pl-8">
          <section>
            <h2 className="font-editorial text-lg font-semibold">책 정보</h2>
            <div className="mt-3 grid grid-cols-[74px_minmax(0,1fr)] gap-4">
              <Image
                src={bookCoverThumbnail}
                alt="만들기전에 검증하라 표지"
                width={458}
                height={641}
                sizes="74px"
                className="h-auto w-[74px] border border-[color:rgb(9_41_68_/_12%)]"
              />
              <div className="min-w-0">
                <h3 className="font-editorial text-sm font-semibold">
                  만들기전에 검증하라
                </h3>
                <p className="mt-1 text-[11px] leading-4 opacity-56">
                  바이브코딩, 1인기업, AI SaaS의 착각들
                </p>
                <dl className="mt-2 space-y-1 text-[10px] leading-4">
                  <div className="flex gap-2">
                    <dt className="w-12 opacity-48">저자</dt>
                    <dd>윤강혁</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-12 opacity-48">출판사</dt>
                    <dd>e퍼플</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-12 opacity-48">출간일</dt>
                    <dd>2026.09.04</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-12 opacity-48">페이지</dt>
                    <dd>155쪽</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-12 opacity-48">ISBN</dt>
                    <dd>9791139063158</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <section className="mt-5 border-t border-[color:rgb(9_41_68_/_14%)] pt-4">
            <h2 className="font-editorial text-lg font-semibold">
              다른 책 보기
            </h2>
            <div className="mt-2 divide-y divide-[color:rgb(9_41_68_/_12%)] border-y border-[color:rgb(9_41_68_/_12%)]">
              {upcomingBooks.map((book) => (
                <article
                  key={book.id}
                  className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 py-3"
                >
                  <div
                    className={`flex aspect-[3/4] items-center justify-center border border-[color:rgb(9_41_68_/_12%)] text-[8px] tracking-[0.08em] ${
                      book.id % 2 === 0
                        ? "bg-[var(--navy)] text-[#f4efe6]"
                        : "bg-[color:rgb(255_255_255_/_28%)] opacity-72"
                    }`}
                    aria-hidden="true"
                  >
                    BOOK
                  </div>
                  <div>
                    <h3 className="font-editorial text-sm font-semibold">
                      {book.title}
                    </h3>
                    <p className="mt-0.5 text-[10px] leading-4 opacity-48">
                      {book.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
