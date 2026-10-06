import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createRemoteJWKSet, jwtVerify } from "jose";

const CONFIG_DIR =
  process.env.DECHIVE_CHATGPT_CONFIG_DIR ||
  join(homedir(), ".config", "dechive-chatgpt-worker");
const HOST_FILE = join(CONFIG_DIR, "host.json");
const CREDENTIAL_FILE = join(CONFIG_DIR, "credentials.json");
const REDIRECT_PORT = Number(process.env.DECHIVE_CHATGPT_AUTH_PORT || 1455);
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/auth/callback`;
const RESOURCE = "https://api.openai.com/v1";
const AGENT_NAME = "DECHIVE JARVIS Worker";
const SCOPE =
  "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct";

function base64url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function pkceChallenge(verifier) {
  return base64url(createHash("sha256").update(verifier).digest());
}

async function ensureConfigDir() {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
}

async function loadOrCreateHostId() {
  await ensureConfigDir();
  try {
    const saved = JSON.parse(await readFile(HOST_FILE, "utf8"));
    if (typeof saved.ext_agent_host_id === "string") {
      return saved.ext_agent_host_id;
    }
  } catch {
    // First registration.
  }

  const extAgentHostId = `urn:uuid:${randomUUID()}`;
  await writeFile(
    HOST_FILE,
    JSON.stringify({ ext_agent_host_id: extAgentHostId }, null, 2),
    { mode: 0o600 },
  );
  return extAgentHostId;
}

function openSystemBrowser(url) {
  const platform = process.platform;
  if (platform === "darwin") {
    spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    return;
  }
  if (platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], {
      detached: true,
      stdio: "ignore",
    }).unref();
    return;
  }
  spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
}

async function getOpenIdConfiguration() {
  const response = await fetch(
    "https://auth.openai.com/.well-known/openid-configuration",
  );
  if (!response.ok) {
    throw new Error(`OpenAI OIDC discovery failed: ${response.status}`);
  }
  return response.json();
}

async function waitForCallback(expectedState) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error("ChatGPT authorization timed out."));
    }, 10 * 60 * 1000);

    const server = createServer((request, response) => {
      try {
        const url = new URL(request.url || "/", REDIRECT_URI);
        if (url.pathname !== "/auth/callback") {
          response.writeHead(404).end("Not found");
          return;
        }

        const state = url.searchParams.get("state");
        const code = url.searchParams.get("code");
        const issuedClientId =
          url.searchParams.get("client_id") ||
          url.searchParams.get("issued_client_id");

        if (!code || state !== expectedState) {
          throw new Error("Invalid OAuth callback.");
        }

        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        response.end(
          "<h1>DECHIVE JARVIS 연결 완료</h1><p>이 창을 닫아도 됩니다.</p>",
        );
        clearTimeout(timeout);
        server.close();
        resolve({ code, issuedClientId });
      } catch (error) {
        clearTimeout(timeout);
        server.close();
        reject(error);
      }
    });

    server.listen(REDIRECT_PORT, "127.0.0.1");
  });
}

async function main() {
  const config = await getOpenIdConfiguration();
  const extAgentHostId = await loadOrCreateHostId();
  const state = base64url(randomBytes(32));
  const nonce = base64url(randomBytes(32));
  const verifier = base64url(randomBytes(48));
  const challenge = pkceChallenge(verifier);

  const authorize = new URL(config.authorization_endpoint);
  authorize.searchParams.set("client_id", "dynamic_agent_client");
  authorize.searchParams.set("agent_name_hint", AGENT_NAME);
  authorize.searchParams.set("ext_agent_host_id", extAgentHostId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", REDIRECT_URI);
  authorize.searchParams.set("scope", SCOPE);
  authorize.searchParams.set("resource", RESOURCE);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("nonce", nonce);
  authorize.searchParams.set("code_challenge_method", "S256");
  authorize.searchParams.set("code_challenge", challenge);

  const callbackPromise = waitForCallback(state);
  console.log("Opening ChatGPT authorization...");
  openSystemBrowser(authorize.toString());

  const { code, issuedClientId } = await callbackPromise;
  if (!issuedClientId) {
    throw new Error("OpenAI did not return an issued client_id.");
  }

  const tokenResponse = await fetch(config.token_endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: issuedClientId,
      code,
      code_verifier: verifier,
      redirect_uri: REDIRECT_URI,
      resource: RESOURCE,
    }),
  });

  const token = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(
      `OpenAI token exchange failed: ${tokenResponse.status} ${JSON.stringify(token)}`,
    );
  }

  const jwks = createRemoteJWKSet(new URL(config.jwks_uri));
  const verified = await jwtVerify(token.id_token, jwks, {
    issuer: config.issuer,
    audience: issuedClientId,
  });

  if (verified.payload.nonce !== nonce) {
    throw new Error("ID token nonce mismatch.");
  }

  const scopes = String(token.scope || "").split(/\s+/).filter(Boolean);
  if (!scopes.includes("chatgpt.tokens.use.direct")) {
    throw new Error(
      "ChatGPT plan usage was not granted. Reconnect and allow plan usage.",
    );
  }

  const now = Date.now();
  const record = {
    email: verified.payload.email || null,
    issuer: config.issuer,
    subject: verified.payload.sub,
    client_id: issuedClientId,
    ext_agent_host_id: extAgentHostId,
    id_token: token.id_token,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    token_type: token.token_type,
    expires_in: token.expires_in,
    expires_at: now + Number(token.expires_in || 3600) * 1000,
    scopes,
    saved_at: new Date(now).toISOString(),
  };

  await writeFile(CREDENTIAL_FILE, JSON.stringify(record, null, 2), {
    mode: 0o600,
  });

  console.log(`Saved protected credentials: ${CREDENTIAL_FILE}`);
  console.log(
    "Next: transfer the .config/dechive-chatgpt-worker directory to the self-hosted VM over a secure channel.",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
