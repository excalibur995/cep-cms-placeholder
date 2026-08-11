# Rewards (TREATS) — FSD v1.1 → CEP CMS Requirements

> Summary of `docs/FSD_Rewards_v1.1@20260728 (Comment).xlsx` (28 sheets, v1.1, 28-Jul-26,
> author Melissa Dian, Figma "[UI] Rewards - ID") mapped to the `cep-cms` Strapi 5 project.
> Purpose: what the CMS must serve for the Rewards module, what already exists, what is net-new.

---

## 1. Executive summary

Rewards (internally **TREATS**) is a loyalty program: three currencies (**TREATS Points /
Cash / Miles**) + a white-card tier ranking (Onyx / Emerald / Diamond). 28 screens.

Every screen's FSD cites its data source. Three sources recur:

| Source | Owns | Ours? |
|---|---|---|
| **CMS** | screen copy, labels, tooltips, placeholders, empty-state + error text, illustrations/icons/banners, **Promotions Articles**, onboarding content, tier content, notification templates | **Yes** |
| **Alpabit** | rewards engine — balances, catalogue reward items, product types, redemptions, current tier/conversion setting | No |
| **NGBO / NGA / Referral Engine** | feature flags, sort options, referral codes/steps, user state | No |

**Consistent pattern: CMS supplies the static shell (copy + media + config); backend engines
supply dynamic data.** So "lots of CMS" is true in breadth, but ~80% is repetitive UI-copy +
media that maps to collections this repo already has. The one substantial net-new content
type is **Promotions Articles**.

---

## 2. FSD sheet map

| Sheet | Function | CMS load |
|---|---|---|
| 1.0 | Entry Points | copy/nav labels |
| 2.0 | Onboarding | illustration/title/desc per rewards type, 1–5 screens, feature flag |
| 3.0 | Dashboard | titles, section labels, TREATS-type icons, tier art (balances = Alpabit) |
| 3.1 | Dashboard Ranking | **tier content**: label/illustration/description + benefits per tier |
| 3.2 | Meatball Menu | menu item labels/icons |
| 3.3 | Summary | copy |
| 3.4.1 | Cash Redeem | copy, labels |
| 3.4.2 | Points/Miles Catalogue | screen/tab/tooltip/filter copy, placeholders, empty-state art (items = Alpabit) |
| 3.4.2.1/.2 | TP / TM Item Details | copy (item data = Alpabit) |
| 3.4.3–3.4.5 | Cart / Confirmation / Final | copy |
| 3.5 / 3.5.1 | View Redemption / Detail | copy |
| 4.0 | Conversion Settings | conversion-type name/description, titles, pop-up copy |
| **5.0** | **Promotions** | **Promotions Articles (net-new), onboarding drawer, list/filter/sort copy, empty-state, learn-more config** |
| 6.0 | Referral | titles/sections, images/banners, step headers, **TnC + FAQ** (steps/codes = Referral Engine) |
| 7.0 / 7.1 | Redeem Code | field labels, tooltips, placeholders, banner, consent/pop-up copy |
| 8.0 | Notifications | **PN×2 / Web inbox / Email / SMS templates, placeholder vars, per-locale** |
| 9.0 | Event Tracking | analytics (not CMS) |
| 10.x | Appendix | eligibility matrix, txn display format (reference) |

---

## 3. CMS scope grouped by content shape

| # | Shape | Sheets | Maps to |
|---|---|---|---|
| A | Static UI copy (titles, labels, tooltips, placeholders, empty-state, errors) | all | `i18n-content` + `i18n-key`, or `screen.components` JSON |
| B | Media (illustrations, icons, banners, tier art, article/referral images, placeholders) | 2,3,3.1,5,6 | `media-asset` / `security-image` + `CDN_URL` |
| C | **Promotions Articles** | 5.0 | **net-new `promotion-article`** |
| D | Notification templates | 8.0 | `notification-template` (exists) |
| E | Onboarding config (per-type content, 1–5 screens) | 2.0 | `screen` JSON or `i18n-content` |
| F | Tier content (3 tiers × label/art/desc/benefits[]) | 3.1, 3.0 | small collection or `screen` JSON |
| G | Content pages — Referral TnC & FAQ | 6.0 | `help-support-setting` pattern / `i18n-content` |
| H | Tag/category registry (Promotions filter pills) | 5.0 | small collection + custom-field dropdown (mirror product-category) |

---

## 4. Map to existing CMS (reuse vs build)

Current collections: `screen`, `navigator`, `stp-screen`, `security-image`,
`notification-template`, `i18n-content`, `i18n-key`, `help-support-setting`, `media-asset`,
`receipt-template`, `product-group`, `product-category`, `product`.

**Reuse — no new model (~80%):**
- A → `i18n-content` (moduleId+locale JSON) / `i18n-key` / `screen.components`.
- B → `media-asset` (`mediaId` + json `list`) / `security-image` + CDN prefix.
- D → **`notification-template`** already models push×2 / web inbox / email / SMS, auto-generates `templateId` (UUID), pushes to `NOTIFICATION_TEMPLATE_API_URL`, per-locale via `parentLanguageId`. Rewards notifications = data entry.
- E, F, G → `screen` JSON / `help-support-setting` pattern / `i18n-content`.

**Net-new build:**
- C — `promotion-article` collection (i18n). See §6.
- H — optional `promotion-category` (tag) registry + searchable custom field.

**Reuse insight:** C + H are the same shape as the existing **Product Catalog cascade**
(`product-group` → `product-category` → `product`: code-keyed JSON + searchable admin
dropdowns `global::product-group-code` / `product-category-code` in
`src/admin/components/*CodeInput.tsx`, list layouts in `src/lib/admin/list-layouts.ts`,
field labels in `src/lib/admin/field-labels.ts`, webhook auto-emit on any `*Id` field). Clone
the pattern; don't invent.

---

## 5. Specific CMS needs per module (from the FSD)

**2.0 Onboarding** — per rewards type (Lifestyle / Redeem / TREATS): illustration, title,
description, rewards-type indicator. Screen count configurable 1–5 (UX rec ≤3). Entry-point
nav + button labels. (Onboarding on/off flag = NGBO.)

**3.0 Dashboard** — screen title; section labels (Overview / Insights); TREATS-type icons;
white-card ranking tier name/illustration/description. Balances, month-to-date, ranking data = Alpabit.

**3.1 Ranking** — screen title/sub-title, tab names; section title/description; **per tier
(Onyx/Emerald/Diamond): tier label, illustration, description, and benefits list (each: icon,
title, description)**; tier-progress copy. Current tier name = Alpabit.

**3.4.2 Catalogue** — screen title/sub-title, tab names, cart icon; "Available rewards/airlines"
labels + tooltip icon; tooltip drawer title+description per type; sort-by drawer title;
filter screen title; point-range placeholder text; empty-state illustration/header/body.
Reward items, product types, sort options = Alpabit.

**4.0 Conversion Settings** — screen/section title + sub-title; per conversion type
(Flexible / Cash / Points / Miles): name + description; confirm pop-up title + description;
"Convert TREATS" drawer title. Current setting = Alpabit.

**5.0 Promotions** — the big one:
- Onboarding drawer: illustration, title, description.
- List screen: screen title, search/sort/filter controls, country tabs (All/ID/MY/SG/PH/KH).
- **Promotions Article** (per article, i18n): tagging/categories (max 3, cater 5), name
  (≤26 char list / ≤20 detail), short description (≤63), body content (≤1200, emojis + line
  breaks), image (97×55 list; larger detail; placeholder fallback), published date, country
  applicability (multi), **recommended flag** (drives Recommended sort), start/end (expiry)
  dates (drives active + Ending-soon), **learn-more: type = web-viewer | in-app + link/deeplink**.
- Filter: category pills sourced from **published article tags** (dynamic vocab).
- Empty-state: configurable illustration + message. Feature flag on/off. Only active
  (published, non-expired) articles shown. Sort: Recommended / Ending soon / Newest (rules per §5.0).

**6.0 Referral** — screen/section titles + sub-titles; referral image (product illustration /
marketing mission 343×343 / placeholder); "How it works" section header; **TnC + FAQ content
pages**. Codes, earnings, steps, history = Referral Engine.

**7.0 Redeem Code** — screen title + sub-title; banner (icon/background/text); field labels +
tooltip icons + placeholders for Promo / Referral / Sales code; "Proceed without a code?"
pop-up title + description; consent pop-up title + description; drawer titles.

**8.0 Notifications** — per Rewards event (e.g. redemption in-progress/success/failure),
multi-channel templates: Push (channel, title, content, in-app navigation), Web inbox, Email
(subject + content), SMS (content). Placeholder variables (`$transaction_type$`,
`$reference_number$`, `--[CUSTOMER NAME]--`, …). Per-locale (ID content provided). Trigger +
category + realtime/batch metadata. → **fits existing `notification-template` collection.**

---

## 6. Proposed net-new: `promotion-article` (draft field spec)

i18n-enabled (per user language), draftAndPublish.

| Field | Type | Notes |
|---|---|---|
| `title` | string | ≤26 list / ≤20 detail (truncate w/ ellipsis) |
| `shortDescription` | string | ≤63 |
| `bodyContent` | richtext/text | ≤1200, emojis + line breaks |
| `image` | media / json | `mediaId` ref; placeholder fallback |
| `tags` | json (string[]) | max 3, cater 5; feeds filter pills |
| `countries` | json (enum[]) | ID / MY / SG / PH / KH (multi) |
| `publishedDate` | datetime | display + Newest sort |
| `startDate` / `endDate` | datetime | active window + Ending-soon sort |
| `recommended` | boolean | Recommended sort |
| `learnMoreType` | enum | `web-viewer` \| `in-app` |
| `learnMoreLink` | string | URL or in-app deeplink |
| `promotionArticleId` | string/uid | key + triggers webhook (`*Id` auto-detected) |

Optional `promotion-category` registry (`categoryCode`, `categoryName`) + custom-field
dropdown, mirroring `product-category`.

---

## 7. Screen separation decision (should Rewards leave `screen`?)

- **Promotions Articles → always own collection** (content ≠ screen layout).
- **Rewards screen shells → default: keep in `screen`, categorize by `journeyId="rewards"`.**
  Same shape (journeyId + screenId + version + components json); the field already gives admin
  filtering. No new code.
- **Split into a `rewards-screen` collection only if** a separate team owns Rewards content
  (collection-level RBAC), editors are non-technical and want a dedicated nav entry, or Rewards
  screens need fields `screen` lacks. Precedent exists: this repo already splits `stp-screen`
  from `screen` for the same domain-clarity reason — so a split is in-convention, just not free
  (duplicates the versioned-screen controller).

---

## 8. Open questions (confirm before build)

1. Does a **separate team** author Rewards content? (decides RBAC + screen split)
2. Which items are CMS-authored vs. **Alpabit/NGBO**-owned? (lock the ownership boundary)
3. Promotions Articles: exact field list + validation vs. Figma; is `bodyContent` rich HTML or plain?
4. Tags: free controlled vocab (registry collection) or fixed enum?
5. Referral TnC/FAQ: reuse `help-support-setting` or new content page?

---

## 9. Build outline (only if approved)

1. `promotion-article` (+ optional `promotion-category`) — clone Product Catalog pattern:
   schema + thin controller + i18n + admin dropdown + list layout + field labels.
2. `npx strapi ts:generate-types`; `npm run dev` boots clean.
3. Enter Rewards notification templates into existing `notification-template`.
4. Land Rewards UI copy → `i18n-content`; media → `media-asset`.

**Verify:** create a Promotions Article in admin → `GET` returns it, locale switch works,
webhook fires, CDN image resolves; add one notification template → pushes to
`NOTIFICATION_TEMPLATE_API_URL`.

---
