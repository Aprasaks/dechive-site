import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR =
  process.env.DECHIVE_CHATGPT_CONFIG_DIR ||
  join(homedir(), ".config", "dechive-chatgpt-worker");
const CREDENTIAL_FILE = join(CONFIG_DIR, "credentials.json");
const RESOURCE = "https://api.openai.com/v1";

async function readCredentials() {
  const credentials = JSON.parse(await readFile(CREDENTIAL_FILE, "utf8"));
  if (!credentials.client_id || !credentials.refresh_token) {
    throw new Error("ChatGPT Plan credentials are incomplete. Run npm run auth.");
  }
  return credentials;
}

async function writeCredentials(credentials) {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  await writeFile(CREDENTIAL_FILE, JSON.stringify(credentials, null, 2), {
    mode: 0o600,
  });
}

async function refreshCredentials(credentials) {
  const response = await fetch(
    "https://auth.openai.com/api/accounts/oauth/token",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: credentials.client_id,
        refresh_token: credentials.refresh_token,
        resource: RESOURCE,
      }),
    },
  );

  const token = await response.json();
  if (!response.ok) {
    throw new Error(
      `ChatGPT Plan token refresh failed: ${response.status} ${JSON.stringify(token)}`,
    );
  }

  const now = Date.now();
  const next = {
    ...credentials,
    id_token: token.id_token || credentials.id_token,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    token_type: token.token_type,
    expires_in: token.expires_in,
    expires_at: now + Number(token.expires_in || 3600) * 1000,
    scopes: String(token.scope || credentials.scopes?.join(" ") || "")
      .split(/\s+/)
      .filter(Boolean),
    saved_at: new Date(now).toISOString(),
  };

  await writeCredentials(next);
  return next;
}

export async function getAccessToken() {
  let credentials = await readCredentials();
  const expiresAt = Number(credentials.expires_at || 0);

  if (!credentials.access_token || expiresAt - Date.now() < 5 * 60 * 1000) {
    credentials = await refreshCredentials(credentials);
  }

  return credentials.access_token;
}

export async function listModels() {
  const accessToken = await getAccessToken();
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `Model listing failed: ${response.status} ${JSON.stringify(data)}`,
    );
  }

  const models = Array.isArray(data.models)
    ? data.models
    : Array.isArray(data.data)
      ? data.data
      : [];

  return models.filter((model) => model.visibility !== "hidden");
}

export function pickModel(models, preferred = []) {
  const slugs = new Set(
    models
      .map((model) => model.slug || model.id)
      .filter((value) => typeof value === "string"),
  );

  for (const candidate of preferred) {
    if (slugs.has(candidate)) return candidate;
  }

  const first = models
    .map((model) => model.slug || model.id)
    .find((value) => typeof value === "string");

  if (!first) throw new Error("No eligible ChatGPT Plan model is available.");
  return first;
}

export async function createResponse({
  model,
  input,
  instructions,
  tools,
}) {
  const accessToken = await getAccessToken();
  const body = {
    model,
    input,
    store: false,
    stream: true,
  };

  if (instructions) body.instructions = instructions;
  if (Array.isArray(tools) && tools.length > 0) body.tools = tools;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    throw new Error(`Responses request failed: ${response.status} ${text}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let output = "";
  let completed = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      const event = JSON.parse(payload);
      if (event.type === "response.output_text.delta") {
        output += event.delta || "";
      } else if (event.type === "response.failed") {
        throw new Error(
          `ChatGPT Plan response failed: ${JSON.stringify(event.response?.error || event)}`,
        );
      } else if (event.type === "response.completed") {
        completed = true;
      }
    }
  }

  if (!completed) {
    throw new Error("ChatGPT Plan stream ended without response.completed.");
  }

  return output;
}
