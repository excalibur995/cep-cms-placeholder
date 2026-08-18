# Payment NGA — Common PN Template ATLAS (v2.5) → CEP CMS Notes

> Summary of `Payment NGA_Common_PN Template ATLAS - Master PNS-2_Batch 1@v2.5 12082026.xlsx`
> (10 sheets, v2.5, last content update 24 Jul 2026) mapped to the `cep-cms` Strapi 5 project.
> Purpose: what this workbook is, how it's meant to be used, and whether/how it maps onto
> what already exists in this repo (`notification-template` content type + seed pipeline).

---

## 1. What this file is

It is **not** a payments spec — it's the **content-authoring guideline and submission
template for all push/SMS/email notifications ("PN") on the NextGen App (NGA)**, covering
Alerts, Transactions, and Promos. "Payment" in the folder name refers to the workstream
(Payments squad), not the file's scope — one of the tabs happens to be a "Transfer Base
Journey" deeplink worksheet, but the bulk of the workbook is generic notification-copy
governance: naming, character limits, dynamic variables, deeplink format, and a 3-step
DPS → Copywriter → DPS review workflow.

An earlier version of this exact workbook (**v1.0**, "Alerts & Transactions" sheet, 114
rows) has already been used once in this repo — see [§4](#4-what-already-exists-in-cep-cms).
v2.5 adds a Promos tab, a Deeplink mapping tab, a rules/principles tab, and expands the
Alerts & Transactions tab to 134 rows.

## 2. Workbook structure (10 sheets)

| # | Sheet | Content |
|---|---|---|
| 1 | `(READ ME) User Guide` | 3-step workflow (DPS input → Copywriting → DPS review), field-by-field glossary for all 13 template fields, character-limit tables by L1 category, deeplink format spec |
| 2 | `Users Type` | One-liner: External → Internal (who fills what) |
| 3 | `Alerts & Transactions` | **134 notification rows** — the main submission template (see §3) |
| 4 | `Promos` | Same shape as #3, tailored to promo/marketing notifications (adds `Media`, drops `Frequency`) |
| 5 | `Deeplink mapping` | 38 rows: Category → Module → Landing screen (Path) → Screen ref → Deeplink string |
| 6 | `Dynamic Variables` | ~40 tagged placeholders (`<Full Name>`, `$amount$`, `$refID$`, `$date$`, `$nickName$`, `$deviceName$`, `$s2uStatus$`, TAC vars, etc.) with formatting rules and examples |
| 7 | `Working Formula` | Lookup tables: L1/L2 category → field → MaxChars; copy/submission status enums |
| 8 | `PN Principles & Rules` | Editorial principles: channel usage (Push vs SMS vs Email), "notify only when it adds value", contextual CTA rules, priority ordering (Security/Fraud > Transaction Outcomes > Status Changes > Reminders > Informational > Marketing) |
| 9 | `Deeplink (new)` | Mostly empty scratch tab, "Transfer Base Journey" heading |
| 10 | `CTA Deeplink (old & proposed)` | 9-row old→new deeplink string migration map (e.g. `WALLET_PAYBILL` → `pay_bills.billers`) |

## 3. The submission template (sheets 3 & 4) — field list

Each notification row carries (Alerts & Transactions variant, 30 columns):

| Field | Notes |
|---|---|
| No, Category, Domain, Module | e.g. `_07_BankingWealth` / `Trx - Transfer local` — a fixed taxonomy (9 top-level Category codes, listed in `Working Formula`) |
| Remarks | free-text internal notes/discussion thread between DPS and PO |
| Notification Name, Notification Type | Type = **Action-based / System-based / Time-based** (interlocked dropdown, defined in the READ ME) |
| Frequency/Batch Run Interval | for System & Time-based only |
| Trigger Description | prose description of what fires the notification |
| L1 category, L2 sub-category | **Alerts / Transactions / Promos** → sub-categories (System announcements, Status update, Money in/out, Marketing events, …) — this drives every character-limit rule downstream |
| Trigger By, Delivery Channel (PN) | |
| PN Preview title / body (+ char counters) | caps: Alerts 30/120, Transactions 30/120, Promos 33/90 |
| PN Inner page title / body (+ char counters) | caps: Alerts 34/450, Promos 90/400, Transactions N/A (system-configured) |
| CTA, CTA description/function, Landing screen (Path), CTA deeplink string | CTA cap: Alerts 26 chars/3 words, Promos 26 chars, Transactions N/A |
| Email Subject, Email Content | format `[Module]: [Mode/Action + status]`; content = required-metrics list, not a full template |
| SMS | cap 153 chars incl. business-unit prefix (M2U/MBB/MIB/MAMG) |
| Requester Name/Email, Date created, Notes | authoring metadata |
| Status of copy, Status of submission | workflow enums: *Ready for review → Reviewed → Approved → Translated*; *Added to requirement → Requirement submitted* |
| Copywriting, DPS (sign-off columns) | who completed which pass |

Promos variant is identical minus `Domain`/`Frequency`, plus a `Media` column (Google Drive
link to a promo banner image, ≤500KB, with 24px safe-padding rule).

## 4. What already exists in cep-cms

This repo already has a **`notification-template` content type**
([schema.json](../../src/api/notification-template/content-types/notification-template/schema.json))
and a one-off seed pipeline that ingested the **v1.0** predecessor of this exact workbook:

- `scripts/notification-templates.batch1.json` — 114 records extracted from the "Alerts &
  Transactions" sheet, one per row (see `scripts/seed-notification-templates.cjs` header comment).
- `scripts/seed-notification-templates.cjs` — upserts by `templateId`, publishes each record.

Schema field coverage vs. the ATLAS template:

| ATLAS field | Strapi field | Status |
|---|---|---|
| PN Preview title/body | `pushTitle1` / `pushMsg1` | ✅ mapped |
| PN Inner page title/body | `pushTitle2` / `pushMsg2` | ✅ field exists, not populated by current seed |
| Email Subject/Content | `emailSubject` / `emailMsg` (+ `emailMsgHtml`, `emailIsHtml`) | ✅ mapped |
| SMS | `smsMsg` | ✅ mapped |
| CTA description, CTA deeplink | `cta_description`, `ctaLink` | ✅ field exists, `ctaLink` not populated by current seed |
| Web inbox equivalent | `webInboxSubject`/`webInboxMsg`/`webInboxDetails` | ⚠️ no ATLAS source column — this repo's schema has a 4th channel ATLAS doesn't model |
| Category, Module, Domain, Notification Type, Trigger By, Delivery Channel, Frequency | — | ❌ **not on the schema** — present in the seed JSON but silently dropped on write (Strapi ignores unknown attrs) |
| L1/L2 category | — | ❌ not on schema — this is the field the whole char-limit rulebook keys off of; without it there's no way to enforce/validate limits per record |
| Status of copy / Status of submission | — | ❌ not on schema — no workflow state tracking beyond Strapi's own Draft/Publish |
| Deeplink mapping (Landing screen ↔ deeplink string) | — | ❌ no content type at all; `Deeplink mapping` sheet has no home |
| Dynamic Variables glossary | — | ❌ no content type; would otherwise live as static reference data or a lookup collection |
| `templateId` | auto-generated UUID via `generate-template-id-middleware.ts` | seed JSON's own `templateId`/`parent_tbl_language_id` values don't line up with the schema field name (`parentLanguageId`) and are effectively unused — the middleware always assigns a fresh UUID on create |

**Net:** the pipeline direction (spreadsheet → JSON → Strapi upsert) is proven and already
run once for v1.0/114 rows. But the current schema only captures the message-content half
of the template (push/email/sms bodies); it drops the entire taxonomy/workflow/governance
half (category, L1/L2, status, char-limit source, deeplink linkage) that this v2.5 workbook
is largely *about*. Re-running the seed against v2.5 as-is would only refresh copy text, not
close that gap.

## 5. Can we do this in Strapi? — Recommendation

Yes, and most of it is straightforward additive schema work, not a new architecture:

1. **Extend `notification-template`** with the taxonomy/workflow fields it's currently
   missing: `category`, `module`, `domain`, `notificationType` (enum), `l1Category` /
   `l2SubCategory` (enums, sourced from the `Working Formula` tables), `triggerBy`,
   `deliveryChannel`, `frequency`, `statusOfCopy` / `statusOfSubmission` (enums), and
   `pushTitle2`/`pushMsg2` + `ctaLink` population in the seed (fields already exist, just
   unused). This alone would let the existing seed script carry the full row, not just the
   message text.
2. **Add a `deeplink-mapping` collection type** (Category, Module, Landing screen path,
   Screen ref, Deeplink string) — the `Deeplink mapping` sheet is already tabular reference
   data with an obvious 1:1 shape.
3. **Dynamic Variables and character-limit tables** are best treated as **static reference
   data**, not editable content — either a small `dynamic-variable` reference collection (for
   documentation/autocomplete in the admin UI) or just kept as this markdown doc + validation
   constants in code. They change rarely and are consumed by whoever writes copy, not by the
   app at runtime.
4. **Character-limit enforcement**: once `l1Category`/`l2SubCategory` are real fields, a
   `beforeCreate`/`beforeUpdate` lifecycle (same place `generate-template-id-middleware.ts`
   already hooks in) can validate `pushMsg1`/`pushMsg2`/`ctaLink` length against the
   `Working Formula` limits server-side, instead of relying on manual spreadsheet char counters.
5. **Promos** notifications fit the same content type with an extra `media` field (single
   media relation) — no need for a separate content type, since the row shape is ~90%
   identical to Alerts & Transactions.

This mirrors the pattern already used for Rewards/Promotions in this repo (see
[REWARDS_CMS_REQUIREMENTS.md](../rewards/REWARDS_CMS_REQUIREMENTS.md)): CMS owns the static
copy/config shell, engines own dynamic data — here, NGA/DPS own the *decision* of when to
fire a notification, CMS owns the *content* of what it says.

## 6. Open questions before extending the schema

- Confirm whether `Status of copy` / `Status of submission` should be modeled as CMS fields
  at all, or stay a spreadsheet/process concern outside Strapi (Draft/Publish + Strapi's
  review workflows plugin may already cover most of this need).
- Confirm whether Web Inbox (`webInboxSubject`/`webInboxMsg`) is still a real channel for
  NGA — ATLAS v2.5 has no column for it, but the schema carries full fields for it.
- Decide whether Dynamic Variables need to be a queryable content type (e.g. for admin-UI
  autocomplete when writing copy) or are fine as documentation only.
