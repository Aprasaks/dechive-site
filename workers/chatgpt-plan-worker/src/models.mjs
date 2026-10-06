import { listModels } from "./openai-plan.mjs";

const models = await listModels();
console.log(
  JSON.stringify(
    models.map((model) => ({
      id: model.slug || model.id,
      name: model.display_name || model.name || null,
    })),
    null,
    2,
  ),
);
