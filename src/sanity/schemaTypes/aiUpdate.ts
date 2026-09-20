import { defineArrayMember, defineField, defineType } from "sanity";

const richTextBlock = defineArrayMember({
  type: "block",
  styles: [
    { title: "본문", value: "normal" },
    { title: "제목 2", value: "h2" },
    { title: "제목 3", value: "h3" },
    { title: "인용문", value: "blockquote" },
  ],
  lists: [
    { title: "글머리 목록", value: "bullet" },
    { title: "번호 목록", value: "number" },
  ],
  marks: {
    decorators: [
      { title: "굵게", value: "strong" },
      { title: "기울임", value: "em" },
      { title: "인라인 코드", value: "code" },
    ],
    annotations: [
      {
        name: "link",
        title: "링크",
        type: "object",
        fields: [
          defineField({
            name: "href",
            title: "주소",
            type: "url",
            validation: (Rule) =>
              Rule.required().uri({
                allowRelative: true,
                scheme: ["http", "https", "mailto", "tel"],
              }),
          }),
          defineField({
            name: "openInNewTab",
            title: "새 탭에서 열기",
            type: "boolean",
            initialValue: true,
          }),
        ],
      },
    ],
  },
});

const relatedImage = defineArrayMember({
  name: "relatedImage",
  title: "관련 이미지",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "ALT",
      description: "이미지를 보지 못해도 내용을 이해할 수 있게 설명하세요.",
      type: "string",
      validation: (Rule) => Rule.required().min(5).max(150),
    }),
    defineField({
      name: "caption",
      title: "캡션",
      type: "string",
      validation: (Rule) => Rule.max(200),
    }),
  ],
  validation: (Rule) => Rule.required(),
});

export const aiUpdate = defineType({
  name: "aiUpdate",
  title: "AI Update",
  type: "document",
  groups: [
    { name: "basic", title: "기본 정보", default: true },
    { name: "content", title: "상세 내용" },
    { name: "meaning", title: "변화와 활용" },
    { name: "source", title: "공식 링크" },
    { name: "publishing", title: "발행 설정" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "제목",
      type: "string",
      group: "basic",
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: "summary",
      title: "요약",
      description: "목록과 검색 결과에 표시될 핵심 내용을 적어주세요.",
      type: "text",
      rows: 4,
      group: "basic",
      validation: (Rule) => Rule.required().min(20).max(240),
    }),
    defineField({
      name: "slug",
      title: "슬러그",
      description: "제목을 입력한 뒤 Generate를 누르면 주소가 생성됩니다.",
      type: "slug",
      group: "basic",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "thumbnail",
      title: "대표 이미지",
      type: "image",
      group: "basic",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "ALT",
          type: "string",
          validation: (Rule) => Rule.required().min(5).max(150),
        }),
        defineField({
          name: "caption",
          title: "캡션",
          type: "string",
          validation: (Rule) => Rule.max(200),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "상세 내용",
      description:
        "업데이트의 배경과 세부 내용을 설명하고 관련 이미지를 넣으세요.",
      type: "array",
      group: "content",
      of: [richTextBlock, relatedImage],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "changes",
      title: "무엇이 바뀌는가",
      description: "이 업데이트 전후의 차이와 영향을 설명하세요.",
      type: "array",
      group: "meaning",
      of: [richTextBlock],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "possibilities",
      title: "이 변화로 무엇을 할 수 있는가",
      description: "독자가 실제로 활용할 수 있는 방법과 가능성을 적어주세요.",
      type: "array",
      group: "meaning",
      of: [richTextBlock],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "officialLink",
      title: "공식 링크",
      type: "url",
      group: "source",
      validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "officialLinkLabel",
      title: "공식 링크 이름",
      description: "예: OpenAI 공식 발표",
      type: "string",
      group: "source",
      initialValue: "공식 발표 보기",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "publishedAt",
      title: "업데이트 일시",
      type: "datetime",
      group: "publishing",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "공개 상태",
      type: "string",
      group: "publishing",
      initialValue: "draft",
      options: {
        layout: "radio",
        list: [
          { title: "초안", value: "draft" },
          { title: "발행 완료", value: "published" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: "최신 업데이트순",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "summary",
      media: "thumbnail",
    },
  },
});
