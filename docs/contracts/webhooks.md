# Webhook System

Reference for engineers integrating with or maintaining the outbound webhook system.

---

## Overview

This project ships a **custom outbound webhook system** implemented as a Strapi v5 Documents Service middleware. It replaces the built-in webhook feature, which requires the Enterprise plan.

On every document mutation across **all collections** the middleware fires a single `POST` to a configured destination. The call is **fire-and-await** (the Strapi response waits for the POST to resolve) and **at-most-once** (no retries). If the destination is unreachable the mutation still succeeds — the failure is only logged. To opt a specific collection out, add its UID to `WEBHOOK_EXCLUDED_UIDS` in `src/lib/constants.ts`.

---

## Architecture

```
Client  →  Strapi REST  →  Documents Middleware  →  dedup / URL resolve  →  emitWebhook  →  POST
```

| File                                     | Responsibility                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/index.ts`                           | Registers `webhookMiddleware` via `strapi.documents.use` in `bootstrap()`                 |
| `src/lib/constants.ts`                   | Config: `WEBHOOK_URL`, `WEBHOOK_EVENT_MAP`, `WEBHOOK_UID_CONFIG`, `WEBHOOK_EXCLUDED_UIDS` |
| `src/lib/webhooks/webhook-middleware.ts` | Deduplication, `updatedBy` resolution, URL routing, calls `emitWebhook`                   |
| `src/lib/webhooks/emit-webhook.ts`       | Builds payload, fires `fetch` POST                                                        |
| `src/lib/webhooks/webhook.types.ts`      | `Context`, `Next`, `UID` type aliases from `@strapi/types`                                |

---

## Configuration

### Environment variable

```env
WEBHOOK_URL=https://your-endpoint
```

Set in `.env`. If empty the middleware skips emitting silently (`emit-webhook.ts:14`).

### Per-UID routing (`src/lib/constants.ts`)

```ts
export const WEBHOOK_UID_CONFIG: Readonly<Partial<Record<UID, string>>> = {};
```

By default the map is empty — every collection falls through to `WEBHOOK_URL`. URL resolution: `WEBHOOK_UID_CONFIG[uid] ?? WEBHOOK_URL` (`webhook-middleware.ts:35`).

To route a specific content type to a different endpoint, add an entry here with its own env var:

```ts
"api::some-type.some-type": process.env.WEBHOOK_URL_SOME_TYPE || "",
```

No middleware code changes are needed.

### Opt-out list

```ts
export const WEBHOOK_EXCLUDED_UIDS: ReadonlySet<UID> = new Set([]);
```

Add a UID to this set to stop it from triggering webhooks entirely.

---

## Triggers

Every Strapi Document action passes through the middleware. The action is mapped to an event name via `WEBHOOK_EVENT_MAP` (`constants.ts:5-11`):

| Strapi document action | Emitted `event` value |
| ---------------------- | --------------------- |
| `create`               | `entry.create`        |
| `update`               | `entry.update`        |
| `publish`              | `entry.publish`       |
| `unpublish`            | `entry.unpublish`     |
| `delete`               | `entry.delete`        |

Actions not listed in the map (e.g. `findOne`, `find`, `count`) are silently ignored.

Webhooks fire for **every content-type UID** that passes through the Documents service unless the UID is listed in `WEBHOOK_EXCLUDED_UIDS`. There is no per-field or dynamic-zone granularity — only whole-document mutations trigger events.

---

## Payload

### Request

| Field         | Value                                   |
| ------------- | --------------------------------------- |
| Method        | `POST`                                  |
| Headers       | `Content-Type: application/json` (only) |
| Body encoding | JSON                                    |

### Body fields

Only fields that exist on the entry are included. The `event` field is always present.

| Field                                            | Type     | Source                      | Description                                                                                                                                                                                                                                                   |
| ------------------------------------------------ | -------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `event`                                          | string   | `WEBHOOK_EVENT_MAP[action]` | Event name (see Triggers table above)                                                                                                                                                                                                                         |
| `uid`                                            | string   | `context.uid`               | Strapi content-type UID (e.g. `api::stp-screen.stp-screen`)                                                                                                                                                                                                   |
| `*Id` (e.g. `screenId`, `overlayId`, `moduleId`) | string?  | entry                       | **Auto-included.** Any top-level string field on the entry whose name ends in `Id` is copied into the payload as-is. `documentId` is excluded. No per-collection config required — adding a new collection with its own `xxxId` field surfaces automatically. |
| `moduleName`                                     | string?  | entry                       | Present on `i18n-content` entries; omitted otherwise                                                                                                                                                                                                          |
| `locale`                                         | string?  | entry                       | Locale code (e.g. `en`) when present                                                                                                                                                                                                                          |
| `version`                                        | integer? | entry                       | Schema version when present                                                                                                                                                                                                                                   |
| `updatedBy`                                      | string?  | request context             | Email or credential name of the actor; may be `undefined` for scripted mutations                                                                                                                                                                              |
| `updatedAt`                                      | string?  | entry                       | ISO-8601 timestamp of the last update                                                                                                                                                                                                                         |
| `entry`                                          | string   | SHA-256 hex                 | `crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex')` — a fingerprint for dedup, **not** the entry data                                                                                                                                   |

Two mechanisms decide what is included (`emit-webhook.ts:3-19`):

```ts
// 1. Static allowlist — generic metadata + named non-Id fields
const staticKeys = ["uid", "version", "updatedBy", "updatedAt", "moduleName", "locale"];

// 2. Auto-included — any top-level string field whose name ends in "Id"
//    (e.g. screenId, overlayId, moduleId), excluding documentId.
```

### Example

```json
{
  "event": "<event-name>",
  "uid": "<content-type-uid>",
  "<xxxId>": "<domain-id>",
  "version": 1,
  "updatedBy": "<user-email>",
  "updatedAt": "<iso-timestamp>",
  "entry": "<sha256-fingerprint>"
}
```

`<xxxId>` is the collection's domain identifier field (e.g. `screenId`, `overlayId`, `moduleId`). Fields specific to certain collections (`moduleName`, `locale`) are included when present on the entry.

Adding a new collection with its own `xxxId` field requires **no code change** — the identifier is picked up automatically. Non-`Id` fields (e.g. `moduleName`) still need to be appended to `staticKeys`.

---

## `updatedBy` Resolution

Resolved in `webhook-middleware.ts:19-21`:

```ts
const ctx = strapi.requestContext.get();
const user = ctx?.state?.user ?? null;
const updatedBy = user?.email ?? ctx?.state?.auth?.credentials?.name ?? undefined;
```

| Scenario                            | `updatedBy` value                        |
| ----------------------------------- | ---------------------------------------- |
| Admin panel user                    | User's email address                     |
| API token request                   | Token name from `credentials.name`       |
| Seed script / direct Documents call | `undefined` (field omitted from payload) |

---

## Routing / Destinations

Resolution order (`webhook-middleware.ts:35`):

1. `WEBHOOK_UID_CONFIG[context.uid]` — per-UID override
2. `WEBHOOK_URL` — global fallback
3. Empty string → `emitWebhook` returns immediately, no POST fired (`emit-webhook.ts:14`)

Current routing configuration:

| UID                | Destination   |
| ------------------ | ------------- |
| All UIDs (default) | `WEBHOOK_URL` |

`WEBHOOK_UID_CONFIG` is intentionally empty — the global `WEBHOOK_URL` fallback governs every collection. Add an entry to the map only when a specific collection needs its own endpoint.

There is no per-event or per-environment routing. To add per-event routing, extend the middleware with an event filter before calling `emitWebhook`.

---

## Deduplication

Two in-process `Set`s suppress spurious duplicate events within a 2-second window (`webhook-middleware.ts:5-33`):

| Mechanism       | Key                      | Suppresses                                                                         |
| --------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `recentCreates` | `documentId`             | `update` fired immediately after `create` (Strapi v5 fires both for a new publish) |
| `recentEmits`   | `${event}:${documentId}` | Same event on the same document within 2 s                                         |

Both Sets are in-process only. **Multi-instance deployments will double-fire** — one emission per running Node process.

---

## Retries and Timeouts

**None.** The implementation makes a single `fetch` call with no explicit timeout (Node default applies).

| Outcome            | Behaviour                                                              |
| ------------------ | ---------------------------------------------------------------------- |
| Response `2xx`     | Webhook considered delivered                                           |
| Response non-`2xx` | `strapi.log.warn(\`Webhook returned ${status} for event "${event}"\`)` |
| `fetch` throws     | `strapi.log.error("Error emitting webhook:", error)`                   |

In both failure cases the error is caught and never propagated. **The document mutation always succeeds regardless of webhook delivery.**

---

## Security

No security is implemented on outbound webhooks today:

- No HMAC signing
- No shared secret / `X-Signature` header
- No bearer token
- No IP allowlist on the receiver side

The `entry` SHA-256 hash is an **integrity fingerprint for deduplication**, not an authenticity proof. Any party who knows `WEBHOOK_URL` can craft a matching POST.

**Recommended receiver behaviour**: treat the webhook as a hint only. Re-fetch the entity from the Strapi API using an authenticated request to verify the change and get the full data. Do not trust webhook payload fields alone for security-sensitive decisions.

### Hardening roadmap

| Gap              | Suggested fix                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| No authenticity  | Add `X-Webhook-Signature: sha256=<hmac>` header using a `WEBHOOK_SECRET` env var; verify on receiver |
| Per-UID secrets  | Extend `WEBHOOK_UID_CONFIG` to a config object `{ url, secret }`                                     |
| No retries       | Add exponential back-off with a max attempt count, or push to a durable queue (BullMQ / SQS)         |
| In-process dedup | Move dedup to Redis or a shared DB table for multi-instance correctness                              |

---

## Consumer Contract

- Receiver SHOULD respond with any `2xx`. Non-`2xx` only logs a warning — it does not trigger a retry.
- Response body is ignored.
- Delivery is **at-most-once**. Design receivers to be idempotent (use the `entry` hash for dedup).
- The `entry` field is a SHA-256 hash of the full Strapi entry, **not the entry data**. Receivers that need the actual content must call back to the Strapi API using the `uid` plus the collection-specific identifier (e.g. `screenId`, `overlayId`, `moduleName`+`locale`). Example: `uid: api::stp-screen.stp-screen` → `GET /api/stp-screens/:screenId`. Use an authenticated admin API call for non-public collections.

---

## Operational Caveats

| Caveat             | Detail                                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Latency            | `await emitWebhook(...)` runs before the Strapi response is returned. A slow receiver directly increases CRUD response time.                                                                        |
| Multi-instance     | Dedup is in-process. Two Strapi instances both emit — expect double delivery in horizontally scaled deployments.                                                                                    |
| Scripted mutations | `scripts/seed-*.cjs` calls `strapi.documents(...).create/update` directly, which passes through the middleware. Seeding fires real webhooks. Point `WEBHOOK_URL` at a test sink when running seeds. |
| No tests           | There are no automated tests for the webhook system. Manual verification is required (see Testing below).                                                                                           |

---

## Extending the System

### Add a new event type

1. Add the action → event name pair to `WEBHOOK_EVENT_MAP` in `src/lib/constants.ts`.
2. Ensure the action produces a result with a `documentId` field (required by `webhook-middleware.ts:17`).

### Add a per-collection destination

To send a specific collection to a different endpoint, add it to `WEBHOOK_UID_CONFIG` in `src/lib/constants.ts`:

```ts
export const WEBHOOK_UID_CONFIG = {
  "api::my-type.my-type": process.env.WEBHOOK_URL_MY_TYPE || "",
};
```

### Exclude a content type

```ts
export const WEBHOOK_EXCLUDED_UIDS: ReadonlySet<UID> = new Set(["api::my-type.my-type"]);
```

### Do not add per-content-type lifecycles

There are no `lifecycles.ts` files in this repo. **Do not add per-content-type lifecycle hooks** to emit webhooks — use the central middleware only. Lifecycle hooks would fire in addition to the middleware and produce duplicates.

---

## Testing Webhooks Locally

1. Get a free inspection URL from [webhook.site](https://webhook.site) (or start a local receiver with `ngrok`).
2. Set `WEBHOOK_URL=https://webhook.site/<your-uuid>` in `.env`.
3. Start Strapi: `npm run dev`.
4. In the admin panel (`http://localhost:1337/admin`) create, update, or publish any entry (any collection).
5. Inspect the inbound POST on webhook.site — confirm the payload matches the shape documented above.

To test that deduplication works correctly, create a new entry and verify only `entry.create` (not a subsequent `entry.update`) arrives.

To test that empty-URL suppression works, unset `WEBHOOK_URL` and confirm no outbound request is made (check network traffic or add a temporary `strapi.log.info` in `emit-webhook.ts:14`).

---

## Reference

| Resource                 | Path                                       |
| ------------------------ | ------------------------------------------ |
| Webhook config constants | `src/lib/constants.ts`                     |
| Middleware registration  | `src/index.ts`                             |
| Dedup + routing          | `src/lib/webhooks/webhook-middleware.ts`   |
| Payload builder + fetch  | `src/lib/webhooks/emit-webhook.ts`         |
| Types                    | `src/lib/webhooks/webhook.types.ts`        |
| Environment variable     | `.env.example` (`WEBHOOK_URL`)             |
| Original PR description  | `docs/rbazzy/pull-request/feat-webhook.md` |
