import { defineField, defineType } from "sanity";

export const knowledgeCategory = defineType({
  name: "knowledgeCategory",
  title: "Knowledge 카테고리",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "카테고리 이름",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(40),
    }),
    defineField({
      name: "slug",
      title: "슬러그",
      type: "slug",
      options: {
        source: "title",
        maxLength: 48,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "간단한 설명",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
  },
});
