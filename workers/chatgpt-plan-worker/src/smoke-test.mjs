import {
  createResponse,
  listModels,
  pickModel,
} from "./openai-plan.mjs";

const models = await listModels();
const model = pickModel(models, [
  "gpt-6.1-sol",
  "gpt-5.6-sol",
  "gpt-5.6-luna",
]);

console.log(`Using ChatGPT Plan model: ${model}`);

const output = await createResponse({
  model,
  instructions:
    "You are a DECHIVE JARVIS connectivity check. Do not use tools.",
  input: [
    {
      role: "user",
      content: "한국어로 정확히 'DECHIVE JARVIS GPT 연결 정상'이라고만 답해.",
    },
  ],
});

console.log(output.trim());
