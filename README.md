# DECHIVE

> AI는 만들고, 인간은 검증합니다.

DECHIVE는 누구나 AI를 쉽게 이해하고 직접 사용해본 뒤, 그 결과를 스스로 검증하고 다시 꺼내 쓸 수 있는 지식으로 남기도록 돕는 AI 학습·검증 플랫폼입니다.

- Live: https://dechive.dev
- Repository preview: https://dechive-site.vercel.app
- Stack: Next.js · TypeScript · Sanity · Tailwind CSS · Vercel

---

## Why

생성형 AI는 글, 이미지, 코드, 답변을 매우 빠르게 만들어냅니다.

하지만 “만들 수 있음”과 “믿을 수 있음”은 같은 문제가 아닙니다. 사용자가 개념을 이해하지 못하거나 결과를 확인할 기준이 없다면 AI 활용은 단순 소비에 머물 수 있습니다.

DECHIVE는 이 간극을 줄이기 위해 다음 흐름을 제품의 기본 원칙으로 잡았습니다.

### CREATE

AI를 활용해 아이디어를 글, 이미지, 코드, 결과물로 빠르게 옮깁니다.

### VERIFY

그럴듯한 답에 멈추지 않고 출처, 맥락, 결과, 한계를 사람이 직접 확인합니다.

### ARCHIVE

확인한 내용과 직접 해본 경험을 다시 꺼내 쓸 수 있는 지식으로 남깁니다.

---

## Product Structure

현재 공개 제품은 4개 영역으로 나뉩니다.

| Area      | Role                                  |
| --------- | ------------------------------------- |
| Knowledge | 오래 남겨야 할 개념과 질문            |
| AI Update | 빠르게 바뀌는 AI 변화와 실제 영향     |
| Practice  | 직접 만들고 결과를 확인하는 실습      |
| Books     | 질문과 검증을 길게 남기는 장문 콘텐츠 |

한 종류의 블로그 글로 모든 것을 처리하지 않고, 사용자가 지금 **배우려는지, 따라 하려는지, 최신 변화를 확인하려는지, 직접 실습하려는지**에 따라 콘텐츠 역할을 분리했습니다.

---

## Learning Experience

DECHIVE의 학습 흐름은 4단계입니다.

1. **쉽게 이해하고**
2. **직접 해보고**
3. **다시 설명하고**
4. **함께 쌓아가기**

읽고 끝나는 구조보다, 이해한 내용을 실제로 사용하고 다시 검증하는 흐름을 우선합니다.

Practice 역시 단순 튜토리얼이 아니라 다음 과정으로 설계합니다.

> 실행 → 결과 해석 → 검증 질문 → 개선

---

## PM / Product Decisions

- 첫 사용자가 AI에 익숙하다고 가정하지 않았습니다.
- 오래 남는 지식과 빠르게 변하는 업데이트를 같은 콘텐츠 타입으로 다루지 않았습니다.
- Practice는 결과물을 만드는 것보다 **결과를 해석하고 검증하는 단계**를 포함하도록 했습니다.
- AI Update는 단순 뉴스 요약이 아니라 **무슨 발표인지 → 무엇이 달라졌는지 → 실제로 무엇을 할 수 있는지**까지 정리합니다.
- 콘텐츠 운영과 공개 렌더링을 분리하기 위해 CMS 구조를 사용합니다.

---

## Current Product Numbers

- 공개 콘텐츠 영역: **4개**
- 핵심 운영 원칙: **3개**
- 기본 학습 흐름: **4단계**

숫자를 성과처럼 과장하기보다, 현재 제품 구조에서 실제로 확인 가능한 범위를 사용합니다.

---

## Tech Stack

- **Next.js 16 / React 19**
- **TypeScript**
- **Sanity / Portable Text**
- **Tailwind CSS**
- **Vercel**

품질 확인을 위해 TypeScript, ESLint, Prettier를 묶은 check script와 Husky / lint-staged를 사용합니다.

---

## Scripts

```bash
npm install
npm run dev
npm run build
npm run check
```

---

## My Role

제품 문제 정의 · 사용자 학습 흐름 설계 · 콘텐츠 제품 구조 · 정보구조 · 검증 기준 · AI Update 운영 규칙 · Practice 경험 설계 · 웹 구현 · 콘텐츠 운영

---

## Related

- DECHIVE: https://dechive.dev
- Studio / Resume: https://studio.dechive.dev
