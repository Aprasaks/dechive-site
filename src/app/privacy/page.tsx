import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy | DECHIVE",
  description:
    "DECHIVE의 개인정보 처리, 쿠키 및 Google AdSense 광고 데이터 이용 안내",
};

const sections = [
  {
    id: "scope",
    number: "01",
    title: "적용 범위와 기본 원칙",
    content: (
      <>
        <p>
          이 개인정보처리방침은 DECHIVE 웹사이트에서 처리되는 정보에 적용됩니다.
          DECHIVE는 서비스를 제공하는 데 필요한 범위에서만 정보를 처리하고,
          목적이 달성된 정보는 관련 법령 또는 서비스 제공자의 보관 기준에 따라
          안전하게 삭제하거나 익명화하는 것을 원칙으로 합니다.
        </p>
        <p>
          현재 사이트는 회원가입, 댓글, 사이트 내 결제 기능을 제공하지 않으며,
          이름이나 연락처를 직접 입력하도록 요구하지 않습니다. 향후 이러한
          기능이 추가되면 수집 항목과 이용 목적을 시행 전에 이 문서에
          반영합니다.
        </p>
      </>
    ),
  },
  {
    id: "automatically-collected-data",
    number: "02",
    title: "자동으로 처리될 수 있는 정보",
    content: (
      <>
        <p>
          사이트 접속 과정에서 IP 주소, 브라우저와 기기 정보, 운영체제, 접속
          일시, 방문·이탈 페이지, 오류 기록과 같은 기술 정보가 호스팅 사업자의
          서버 로그를 통해 자동으로 처리될 수 있습니다.
        </p>
        <p>
          이러한 정보는 사이트의 안정적인 제공, 보안 사고 방지, 오류 분석 및
          이용 현황 파악을 위해 사용될 수 있으며, DECHIVE는 이를 이용해 별도의
          개인 프로필을 직접 구축하지 않습니다.
        </p>
      </>
    ),
  },
  {
    id: "cookies-and-ads",
    number: "03",
    title: "쿠키와 Google AdSense",
    content: (
      <>
        <p>
          DECHIVE가 Google AdSense를 통해 광고를 게재하는 경우, Google을 포함한
          제3자 광고 사업자는 이용자의 이전 DECHIVE 방문 또는 다른 웹사이트 방문
          기록을 바탕으로 광고를 제공하기 위해 쿠키를 사용할 수 있습니다.
          Google의 광고 쿠키는 Google과 그 파트너가 이용자의 방문 정보를
          바탕으로 맞춤형 광고 또는 문맥 기반 광고를 제공하도록 지원합니다.
        </p>
        <p>
          Google 서비스가 적용된 페이지를 방문하면 현재 페이지의 URL, IP 주소,
          브라우저·기기 관련 정보가 Google에 전달될 수 있으며, Google은 광고
          제공, 광고 효과 측정, 부정 사용 방지 및 이용자 설정에 따른 광고
          개인화를 위해 쿠키를 설정하거나 읽을 수 있습니다.
        </p>
      </>
    ),
  },
  {
    id: "ad-controls",
    number: "04",
    title: "맞춤 광고와 이용자 선택권",
    content: (
      <>
        <p>
          이용자는 Google 광고 설정에서 맞춤 광고 사용 여부를 확인하거나 해제할
          수 있습니다. 또한 브라우저 설정에서 쿠키를 삭제·차단할 수 있으며,
          aboutads.info를 통해 일부 제3자 광고 사업자의 맞춤 광고 쿠키 사용을
          해제할 수 있습니다.
        </p>
        <p>
          쿠키를 제한해도 사이트의 일반 콘텐츠는 계속 이용할 수 있지만, 일부
          광고의 관련성이나 측정 기능은 달라질 수 있습니다. 문맥 기반 광고는
          맞춤 광고를 해제한 경우에도 표시될 수 있습니다.
        </p>
      </>
    ),
  },
  {
    id: "consent",
    number: "05",
    title: "지역별 동의와 광고 사업자",
    content: (
      <>
        <p>
          유럽경제지역(EEA), 영국 및 스위스 이용자에게 관련 법령상 동의가 필요한
          광고를 제공하는 경우, DECHIVE는 Google이 인증한 동의 관리 플랫폼을
          통해 쿠키 또는 로컬 저장소 사용과 광고 개인화를 위한 개인정보의
          수집·공유·이용에 관한 선택권을 제공합니다.
        </p>
        <p>
          AdSense 설정에 따라 Google 외의 광고 기술 제공자가 참여할 수 있으며,
          실제로 사용되는 제공자와 각 처리 목적은 동의 화면 또는 연결된 사업자
          안내에서 확인할 수 있도록 합니다.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    number: "06",
    title: "외부 서비스와 정보 처리",
    content: (
      <>
        <p>
          DECHIVE는 사이트 운영을 위해 호스팅, 콘텐츠 전송 및 광고 서비스를
          이용할 수 있습니다. 해당 사업자는 각자의 개인정보처리방침과 법적
          근거에 따라 정보를 처리하며, 국가 간 데이터 이전이 발생할 수 있습니다.
        </p>
        <p>
          사이트의 서점 또는 다른 외부 웹사이트 링크를 선택하면 해당 사업자의
          정책이 적용됩니다. 외부 사이트에서 발생하는 회원가입, 구매, 결제 및
          배송 정보는 DECHIVE가 직접 수집하거나 보관하지 않습니다.
        </p>
      </>
    ),
  },
  {
    id: "retention-and-security",
    number: "07",
    title: "보관 기간과 안전성",
    content: (
      <>
        <p>
          DECHIVE가 직접 보유하는 정보는 처리 목적에 필요한 기간만 유지합니다.
          호스팅 및 광고 사업자가 생성하는 로그와 식별자의 보관 기간은 각
          사업자의 정책과 관련 법령에 따릅니다.
        </p>
        <p>
          합리적인 기술적·관리적 보호 조치를 적용하지만, 인터넷을 통한 전송이나
          전자적 저장 방식의 절대적인 안전을 보장할 수는 없습니다.
        </p>
      </>
    ),
  },
  {
    id: "children",
    number: "08",
    title: "아동의 개인정보",
    content: (
      <p>
        DECHIVE는 만 14세 미만 아동의 개인정보를 의도적으로 직접 수집하지
        않습니다. 관련 정보가 수집된 사실을 알게 되면 관계 법령에 따라 필요한
        조치를 취합니다.
      </p>
    ),
  },
  {
    id: "changes-and-contact",
    number: "09",
    title: "방침 변경과 문의",
    content: (
      <>
        <p>
          서비스 또는 관련 법령·광고 정책이 변경되면 이 방침을 수정할 수
          있습니다. 중요한 변경은 시행 전에 사이트를 통해 알리고, 문서 상단의
          시행일을 갱신합니다.
        </p>
        <p>
          개인정보 처리에 관한 문의와 권리 행사는 사이트 하단의 Contact 채널을
          통해 접수할 수 있습니다. 요청 내용은 본인 확인이 필요한 범위에서 관련
          법령에 따라 처리합니다.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="PRIVACY"
      title="개인정보처리방침"
      englishTitle="Privacy Policy"
      description="DECHIVE는 이용자의 정보를 필요한 범위에서만 다루며, 쿠키와 광고 데이터가 어떻게 사용되는지 투명하게 설명합니다."
      effectiveDate="2026.09.15"
      sections={sections}
      relatedLinks={[
        {
          label: "Google 광고 설정",
          href: "https://adssettings.google.com/",
          external: true,
        },
        {
          label: "Google 파트너 사이트 데이터 안내",
          href: "https://policies.google.com/technologies/partner-sites?hl=ko",
          external: true,
        },
        {
          label: "맞춤 광고 선택 해제 안내",
          href: "https://www.aboutads.info/choices/",
          external: true,
        },
      ]}
    />
  );
}
