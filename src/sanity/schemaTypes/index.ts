import { type SchemaTypeDefinition } from "sanity";

import { knowledge } from "./knowledge";
import { knowledgeCategory } from "./knowledgeCategory";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [knowledge, knowledgeCategory],
};
