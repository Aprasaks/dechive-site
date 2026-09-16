import { defineArrayMember, defineField, defineType } from "sanity";

export const knowledge = defineType({
  name: "knowledge",
  title: "Knowledge 글",
  type: "document",
  groups: [
    { name: "basic", title: "기본 정보", default: true },
    { name: "media", title: "대표 이미지" },
    { name: "content", title: "본문" },
    { name: "publishing", title: "발행 설정" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "제목",
      type: "string",
      group: "basic",
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: "summary",
      title: "요약글",
      description: "목록과 검색 결과에 표시될 글의 핵심 내용을 적어주세요.",
      type: "text",
      rows: 4,
      group: "basic",
      validation: (Rule) => Rule.required().min(20).max(240),
    }),
    defineField({
      name: "slug",
      title: "슬러그",
      description: "제목을 입력한 뒤 Generate를 누르면 주소가 자동 생성됩니다.",
      type: "slug",
      group: "basic",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "카테고리",
      description: "Knowledge의 큰 주제를 선택하세요.",
      type: "reference",
      to: [{ type: "knowledgeCategory" }],
      group: "basic",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "keywords",
      title: "키워드",
      description: "글을 설명하는 핵심 단어를 최대 8개까지 입력하세요.",
      type: "array",
      group: "basic",
      options: { layout: "tags" },
      of: [
        defineArrayMember({
          type: "string",
          validation: (Rule) => Rule.min(1).max(30),
        }),
      ],
      validation: (Rule) => Rule.unique().max(8),
    }),
    defineField({
      name: "thumbnail",
      title: "썸네일",
      type: "image",
      group: "media",
      options: {
        hotspot: true,
      },
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
    }),
    defineField({
      name: "body",
      title: "본문",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
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
        }),
        defineArrayMember({
          name: "bodyImage",
          title: "본문 이미지",
          type: "image",
          options: {
            hotspot: true,
          },
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
        defineArrayMember({
          type: "code",
          title: "코드 블록",
          options: {
            withFilename: true,
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "publishedAt",
      title: "최초 발행일",
      type: "datetime",
      group: "publishing",
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
          { title: "검토 중", value: "review" },
          { title: "발행 예정", value: "scheduled" },
          { title: "발행 완료", value: "published" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "humanVerified",
      title: "사람 검증 완료",
      description:
        "내용을 직접 확인한 뒤 체크하세요. 발행 완료 글에는 필수입니다.",
      type: "boolean",
      group: "publishing",
      initialValue: false,
      validation: (Rule) =>
        Rule.custom((verified, context) => {
          if (context.document?.status === "published" && !verified) {
            return "발행 완료 글은 사람 검증을 먼저 완료해야 합니다.";
          }

          return true;
        }),
    }),
  ],
  orderings: [
    {
      title: "최신 발행순",
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
