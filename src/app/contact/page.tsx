import type { Metadata } from "next";

const inquiryTypes = [
  {
    number: "01",
    english: "LECTURE",
    title: "강의 문의",
    description:
      "AI, 데이터, 기획과 제작을 주제로 한 강의와 워크숍을 함께 기획합니다.",
  },
  {
    number: "02",
    english: "NOTION",
    title: "노션 템플릿 제작",
    description:
      "업무와 지식을 더 잘 정리하고 오래 활용할 수 있는 노션 구조를 만듭니다.",
  },
  {
    number: "03",
    english: "WEBSITE",
    title: "홈페이지 제작",
    description:
      "아이디어와 브랜드의 핵심이 선명하게 보이는 웹사이트를 함께 설계하고 제작합니다.",
  },
];

const contactDetails = [
  {
    label: "EMAIL",
    value: "heavenis0113@gmail.com",
    href: "mailto:heavenis0113@gmail.com",
    action: "메일 보내기",
  },
  {
    label: "PHONE",
    value: "010 4284 4356",
    href: "tel:01042844356",
    action: "전화하기",
  },
];

export const metadata: Metadata = {
  title: "Contact | DECHIVE",
  description:
    "DECHIVE의 강의, 노션 템플릿 제작 및 홈페이지 제작 문의를 안내합니다.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-4 pb-8 text-[var(--navy)] sm:px-7 lg:px-10 xl:px-12">
      <section className="grid gap-8 border-b border-[color:rgb(9_41_68_/_18%)] py-7 lg:grid-cols-[minmax(0,0.6fr)_minmax(350px,0.4fr)] lg:items-stretch lg:gap-12 lg:py-10">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-4 text-[11px] tracking-[0.12em]">
            <span className="font-bold text-[var(--terracotta)]">CONTACT</span>
            <span className="h-px w-5 bg-[var(--terracotta)]" />
            <span className="opacity-52">LET&apos;S MAKE IT TOGETHER</span>
          </div>

          <h1 className="font-editorial mt-5 text-[2.45rem] leading-[1.16] font-semibold tracking-[-0.05em] sm:text-5xl lg:text-[3.25rem]">
            함께 만들 이야기를
            <br />
            들려주세요.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 opacity-68 sm:text-[15px]">
            강의부터 노션 템플릿, 홈페이지 제작까지 필요한 것을 편하게
            알려주세요. 막연한 아이디어만 있어도 괜찮습니다. 무엇을 왜 만들고
            싶은지부터 함께 정리하겠습니다.
          </p>
        </div>

        <div className="border border-[color:rgb(9_41_68_/_14%)] bg-[color:rgb(255_255_255_/_16%)] px-6 py-7 sm:px-8 lg:flex lg:flex-col lg:justify-center">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--terracotta)]">
            DIRECT CONTACT
          </p>
          <div className="mt-5 divide-y divide-[color:rgb(9_41_68_/_13%)] border-y border-[color:rgb(9_41_68_/_15%)]">
            {contactDetails.map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                className="group block py-5 transition-colors hover:text-[var(--terracotta)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold tracking-[0.18em] opacity-48">
                    {contact.label}
                  </span>
                  <span className="text-xs text-[var(--terracotta)]">
                    {contact.action} →
                  </span>
                </div>
                <p className="font-editorial mt-2 text-lg font-semibold break-all sm:text-xl">
                  {contact.value}
                </p>
              </a>
            ))}
          </div>
          <p className="mt-5 text-[11px] leading-5 opacity-52">
            확인 후 순서대로 답변드립니다. 통화가 어려운 경우에는 문자나
            이메일을 남겨주세요.
          </p>
        </div>
      </section>

      <section className="border-b border-[color:rgb(9_41_68_/_14%)] py-7">
        <div className="flex items-baseline gap-4">
          <span className="font-editorial text-sm opacity-50">01</span>
          <h2 className="font-editorial text-xl font-semibold sm:text-2xl">
            이런 일을 함께합니다
          </h2>
        </div>

        <div className="mt-5 grid gap-3 sm:pl-9 md:grid-cols-3">
          {inquiryTypes.map((inquiry) => (
            <article
              key={inquiry.number}
              className="border border-[color:rgb(9_41_68_/_11%)] bg-[color:rgb(255_255_255_/_14%)] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-editorial text-sm text-[var(--terracotta)]">
                  {inquiry.number}
                </span>
                <span className="text-[9px] font-bold tracking-[0.2em] opacity-42">
                  {inquiry.english}
                </span>
              </div>
              <h3 className="font-editorial mt-7 text-lg font-semibold">
                {inquiry.title}
              </h3>
              <p className="mt-2 text-xs leading-5 opacity-60">
                {inquiry.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-7 border-b border-[color:rgb(9_41_68_/_14%)] py-7 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] lg:gap-12">
        <div>
          <div className="flex items-baseline gap-4">
            <span className="font-editorial text-sm opacity-50">02</span>
            <h2 className="font-editorial text-xl font-semibold sm:text-2xl">
              문의할 때 알려주세요
            </h2>
          </div>
          <p className="mt-4 pl-0 text-xs leading-6 opacity-60 sm:pl-9">
            정해진 양식은 없습니다. 아래 세 가지만 적어주시면 더 빠르고 정확하게
            이야기할 수 있습니다.
          </p>
        </div>

        <ol className="divide-y divide-[color:rgb(9_41_68_/_12%)] border-y border-[color:rgb(9_41_68_/_14%)]">
          <li className="grid gap-2 py-4 sm:grid-cols-[42px_150px_minmax(0,1fr)] sm:items-baseline">
            <span className="font-editorial text-sm text-[var(--terracotta)]">
              01
            </span>
            <strong className="font-editorial font-semibold">
              만들고 싶은 것
            </strong>
            <span className="text-xs leading-5 opacity-58">
              강의, 노션 템플릿, 홈페이지 중 필요한 작업
            </span>
          </li>
          <li className="grid gap-2 py-4 sm:grid-cols-[42px_150px_minmax(0,1fr)] sm:items-baseline">
            <span className="font-editorial text-sm text-[var(--terracotta)]">
              02
            </span>
            <strong className="font-editorial font-semibold">
              목표와 대상
            </strong>
            <span className="text-xs leading-5 opacity-58">
              누구를 위해 무엇을 해결하고 싶은지
            </span>
          </li>
          <li className="grid gap-2 py-4 sm:grid-cols-[42px_150px_minmax(0,1fr)] sm:items-baseline">
            <span className="font-editorial text-sm text-[var(--terracotta)]">
              03
            </span>
            <strong className="font-editorial font-semibold">
              일정과 참고자료
            </strong>
            <span className="text-xs leading-5 opacity-58">
              희망 일정과 참고할 링크 또는 문서가 있다면 함께 전달
            </span>
          </li>
        </ol>
      </section>

      <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--terracotta)]">
            START WITH A CONVERSATION
          </p>
          <h2 className="font-editorial mt-3 text-2xl leading-snug font-semibold sm:text-3xl">
            좋은 결과물은 좋은 대화에서 시작합니다.
          </h2>
          <p className="mt-3 max-w-2xl text-xs leading-6 opacity-62 sm:text-[13px]">
            아직 구체적이지 않아도 괜찮습니다. 지금 가진 생각부터 편하게
            보내주세요.
          </p>
        </div>
        <a
          href="mailto:heavenis0113@gmail.com"
          className="inline-flex h-10 w-fit items-center border border-[var(--terracotta)] px-5 text-xs font-semibold text-[var(--terracotta)] transition-colors hover:bg-[var(--terracotta)] hover:text-[#fffaf2]"
        >
          이메일로 문의하기 →
        </a>
      </section>
    </main>
  );
}
