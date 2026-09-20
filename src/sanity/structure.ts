import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("DECHIVE")
    .items([
      S.listItem()
        .title("Knowledge")
        .child(
          S.list()
            .title("Knowledge")
            .items([
              S.documentTypeListItem("knowledge").title("글"),
              S.documentTypeListItem("knowledgeCategory").title("카테고리"),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("aiUpdate").title("AI Update"),
    ]);
