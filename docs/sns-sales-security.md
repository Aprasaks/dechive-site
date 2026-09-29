# SNS Sales Security Architecture

## Purpose

This document defines the security boundary for the public SNS sales automation program at:

- `https://dechive.dev/practice/sns-sales`

The legacy HEYMI prototype is reference-only. Its public, connectionId-based endpoints must not be reused for the production service.

## Core isolation decision

Use a dedicated Supabase project for SNS Sales even though it is owned by the same Supabase account/organization.

Reason:

- Instagram access tokens are sensitive credentials.
- Buyer comments and payment metadata are user/customer data.
- A security incident in SNS Sales must not expose or affect the primary DECHIVE database.
- Auth, Storage, database policies, Edge Functions, and secrets need an independent blast radius.

## Authentication boundary

A user must authenticate to DECHIVE SNS Sales before connecting Instagram.

The browser may hold a normal Supabase user session. It must never receive:

- Supabase service-role key
- Instagram App Secret
- Instagram access token
- Toss secret key
- Toss webhook secret values

Every private Edge Function must:

1. Require a valid Supabase JWT.
2. Resolve the authenticated user on the server.
3. Verify ownership of the referenced workspace, Instagram connection, campaign, media, queue, or payment.
4. Never trust a user-supplied `user_id`.

## Instagram connection

Production OAuth flow:

1. Authenticated DECHIVE user requests Instagram connection.
2. Server creates a one-time OAuth state tied to the authenticated user.
3. State expires quickly and is single-use.
4. Instagram callback exchanges the code server-side.
5. Access token is stored server-side only.
6. Callback stores the connection with `user_id = authenticated owner`.
7. Browser receives only a safe connection status, not the access token.

Do not use a bare `connection_id` as authorization.

## Database ownership model

Every user-owned row must have `user_id uuid not null` or inherit ownership through a parent with an enforced foreign key.

Suggested hierarchy:

- profiles
- instagram_connections
- campaigns
- campaign_media
- instagram_comments
- purchase_queue
- payment_sessions
- automation_events
- publish_jobs
- outbound_message_jobs

RLS must be enabled on every user-owned table.

Base policy principle:

`auth.uid() = user_id`

For child rows, policy must resolve ownership through the parent relationship.

No anonymous direct access to private sales data.

## Storage

Use a private bucket for uploaded sales media.

Object path convention:

`users/{user_id}/campaigns/{campaign_id}/{asset_id}.{ext}`

Requirements:

- authenticated upload only
- ownership policy on object path
- server-side MIME/type/size validation before publishing
- signed URLs only when external services require temporary access
- no permanent public bucket for user uploads

## Edge Functions

Private functions must use JWT verification and ownership checks.

Examples:

- create campaign
- upload media
- publish Instagram content
- resync comments
- issue payment
- read/manage queue

Public functions are limited to external callbacks:

- Instagram OAuth callback
- Meta webhook
- Toss webhook

Public callbacks must validate their own protocol-specific proof and never expose private data.

## Webhooks

Meta webhook:

- validate Meta verification handshake
- validate request authenticity according to current Meta requirements
- deduplicate events
- map incoming Instagram account/media IDs to the correct connection/campaign
- enqueue processing rather than performing long work inline

Toss webhook:

- validate webhook secret/verification data
- re-query Toss payment API before marking payment complete
- verify order ID, amount, and final status
- make updates idempotent

## Payment boundary

Do not allow an unauthenticated browser to request virtual-account issuance.

Payment creation must be server-controlled and linked to:

- campaign
- current reserved queue entry
- authenticated seller
- immutable expected amount

The browser must not be allowed to choose an arbitrary payable amount for a live sale.

## Automation timing

Reservation expiration must be server-driven.

The browser countdown is display-only.

Database timestamps such as `reserved_at` and `due_at` are authoritative.

On expiration:

1. current reservation -> expired
2. next waiting buyer -> reserved
3. new payment session created
4. outbound reply/private message jobs enqueued

## Multi-campaign requirement

Each Instagram post is represented by an independent campaign.

Each campaign owns its own:

- trigger keyword
- media
- Instagram media ID
- comments
- queue
- active reservation
- payment sessions
- outbound replies/messages
- automation status

No global queue shared across posts.

## Logging

Never log:

- Instagram access tokens
- Supabase service-role key
- Toss secret key
- webhook secrets
- full payment credentials

Security logs should record identifiers, action, actor, status, and timestamps without credential material.

## Legacy HEYMI

The legacy HEYMI functions currently include unauthenticated endpoints and service-role access.

They must not be called by the production SNS Sales page.

Before public launch, legacy debug endpoints and unused prototype endpoints should be disabled or removed after confirming they are no longer needed.

## Launch gate

Do not call SNS Sales production-ready until all are verified:

- dedicated Supabase project
- Supabase Auth enabled
- RLS policies tested with two separate users
- no service-role key in browser bundle
- Meta token never returned to browser
- private Storage policies tested
- private Edge Functions reject anonymous requests
- cross-user IDOR tests fail
- Meta OAuth state bound to signed-in user
- webhook verification and deduplication tested
- rate limits added
- payment amount/order ownership verified server-side
- security advisor reviewed
- production keys rotated after testing
