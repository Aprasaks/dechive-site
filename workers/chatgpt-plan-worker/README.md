# DECHIVE ChatGPT Plan Worker

This worker is the official-path replacement for automating the consumer ChatGPT website.

## Why this exists

DECHIVE JARVIS should be able to run from iPhone without keeping a Mac awake. The preferred text pipeline is:

JARVIS Remote → self-hosted worker → Sign in with ChatGPT → Responses API → verifier → Sanity → human approval → publish.

This uses the user's eligible ChatGPT Plus/Pro plan through OpenAI's Sign in with ChatGPT open-source flow. It does not scrape ChatGPT web pages and does not ask for the user's ChatGPT password, cookies, or API key.

## Current scope

Implemented in this scaffold:

- Dynamic Sign in with ChatGPT registration with PKCE.
- Stable `ext_agent_host_id`.
- ID-token validation through OpenAI OIDC/JWKS.
- Protected local credential storage.
- Refresh-token rotation.
- ChatGPT-plan model discovery.
- Streaming Responses API request with `store:false` and `stream:true`.
- Smoke test.

Not implemented yet:

- JARVIS Supabase queue claim/submit bridge.
- Knowledge research/draft/verify orchestration.
- Remote UI health indicator for this worker.
- Automatic image generation.

## Important current limitation

The current Sign in with ChatGPT preview does not support the Responses image-generation tool. Text, image/file inputs and web search can be supported by eligible models, but image generation is not available through this plan-sharing route.

Therefore the first production version will use ChatGPT Plan for Knowledge text work and keep the existing human image handoff until an official plan-based image route exists or a separate image provider is chosen.

## Local authorization

Requirements:

- Node.js 22+
- Eligible ChatGPT Plus or Pro account

Run:

```bash
cd workers/chatgpt-plan-worker
npm install
npm run auth
npm run models
npm run smoke
```

The authorization command opens the system browser and stores protected credentials under:

```
~/.config/dechive-chatgpt-worker/
```

Do not commit that directory.

## Self-hosted VM

OpenAI documents a self-hosted VM flow. Complete OAuth locally first, then securely transfer the protected credential directory to the user's VM. The VM keeps its own stable host ID and manages later token refreshes.

The VM must be controlled by the same user whose ChatGPT plan is authorized.

## Security rules

- Never collect a ChatGPT password.
- Never copy ChatGPT browser cookies into JARVIS.
- Never call private ChatGPT backend endpoints.
- Never automate the consumer ChatGPT web UI to extract output.
- Never store credentials in Git, logs, analytics, Supabase, or Vercel.
- Keep credential files owner-readable only.

## Next step

Provision one always-on user-controlled VM, transfer the authorized credential bundle, run the smoke test there, then connect the VM to the JARVIS Supabase queue using a narrowly scoped worker bridge.
