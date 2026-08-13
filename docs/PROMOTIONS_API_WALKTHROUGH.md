# Promotions API — Walkthrough

Hands-on guide to the `promotion-article` / `promotion-tag` API built for FSD 5.0
Promotions. For the *why* behind the design, see `docs/REWARDS_CMS_REQUIREMENTS.md` and
`docs/PROMOTIONS_FILTER_SORT_SPEC.md`. This doc is just: how to run it, call it, and what
comes back.

---

## 1. Run it

```bash
npm run dev                          # boots Strapi on :1337
npm run seed:promotions -- --run     # upserts 3 tags + 3 sample articles
```

Seeding is idempotent (upserts by `tagCode` / `promotionArticleId`) — safe to re-run.
Dry-run without `-- --run` just prints the payload, writes nothing.

**Note:** the seed script boots its own headless Strapi instance to write via the
Document Service directly. Stop the dev server first (`lsof -ti :1337 | xargs kill`) to
avoid two processes writing to the same sqlite file concurrently, then restart `npm run
dev` after seeding.

## 2. What's seeded

| `promotionArticleId` | title | countries | tags | recommended | bodyContent shape |
|---|---|---|---|---|---|
| `promo-seed-oasia` | Far East Hospitality OASIA | SG, MY | cashback | true | paragraph → paragraph → heading+paragraph (T&C) → heading+list (locations) — mirrors the actual FSD mockup |
| `promo-seed-firefly` | Firefly Flight Deals | ID | cashback | false | plain paragraphs only, no structure |
| `promo-seed-takumi` | Takumi Dining Offer | ID, KH | dining, savings | false | paragraph with inline bold → heading → list |

Tags seeded: `cashback`, `dining`, `savings`.

## 3. Endpoints

| Method | Path | What |
|---|---|---|
| GET | `/api/promotion-articles` | list — filter/sort/search/paginate |
| GET | `/api/promotion-articles/:promotionArticleId` | single article, tags populated |
| GET | `/api/promotion-articles/tags` | distinct tags **in use on active, published articles** — pill source |
| GET | `/api/promotion-articles/countries` | static 5-tuple, FSD order, no DB |
| POST/PUT/DELETE | `/api/promotion-articles(/:id)` | write (see §6 on why these bypass the stock sanitizer) |
| GET | `/api/promotion-tags` | full tag table (admin/authoring — not the pill source) |
| POST/PUT/DELETE | `/api/promotion-tags(/:id)` | write |

Every route is `auth:false` per this repo's convention — no token needed.

## 4. Query params — `GET /promotion-articles`

| Param | Cardinality | Values | Notes |
|---|---|---|---|
| `country` | **single** | `All` (default) \| `ID`\|`MY`\|`SG`\|`PH`\|`KH` | tab model, not a filter — FSD has one active tab at a time |
| `tags` | **multi**, csv | tag codes, e.g. `cashback,dining` | match-any |
| `search` | single | free text | matches `title` only, **ignored below 2 chars** (server-enforced, not just client) |
| `sort` | single | `recommended` (default) \| `ending-soon` \| `newest` | see §5 |
| `page` / `pageSize` | — | numbers | default `1` / `10` |
| `locale` | — | e.g. `id` | i18n |

Always on, regardless of params: only `published` + currently-active (`startDate <= now <=
endDate`) articles are returned. There's no way to ask for expired/unpublished ones through
this endpoint.

All params compose — `country`, `tags`, `search`, `sort` all apply together, each narrowing
the previous stage. `country=All` and omitting `country` are equivalent.

## 5. Sort — the three modes

`recommended` (default), `ending-soon`, `newest`. On the **All tab**, every mode shares the
same skeleton before its own tiebreak: `recommended` flag first (recommended mode only) →
country-count descending (5→1 countries) → for 1-country articles, fixed priority
`ID>MY>SG>PH>KH` → mode tiebreak → title alphabetical. On a **single country tab**, the
country-count tiering is skipped entirely — just the mode tiebreak, then title.

Mode tiebreak: `recommended`/`newest` → `publishedDate` descending. `ending-soon` →
`endDate` ascending.

## 6. Worked examples

```bash
# Full list, default sort (recommended first)
curl "http://localhost:1337/api/promotion-articles"
# -> oasia (recommended), takumi/firefly by country-count+priority tiebreak

# One tab
curl "http://localhost:1337/api/promotion-articles?country=ID"
# -> firefly, takumi (both applicable to ID; oasia excluded, SG/MY only)

# Multi-tag filter (match-any)
curl "http://localhost:1337/api/promotion-articles?tags=dining,savings"
# -> takumi only

# Search, case-insensitive substring, title only
curl "http://localhost:1337/api/promotion-articles?search=Fire"
# -> firefly

# Search under 2 chars — silently ignored, returns everything active
curl "http://localhost:1337/api/promotion-articles?search=D"
# -> all 3

# Everything combined
curl "http://localhost:1337/api/promotion-articles?country=ID&tags=dining&search=Takumi&sort=newest"
# -> takumi

# Pill source (only tags actually used on active articles)
curl "http://localhost:1337/api/promotion-articles/tags"

# Static country list
curl "http://localhost:1337/api/promotion-articles/countries"

# Single article, tags populated
curl "http://localhost:1337/api/promotion-articles/promo-seed-oasia"
```

## 7. `bodyContent` — Strapi Blocks, not plain text

Switched from plain `text` to `blocks` after checking the FSD's actual mockup screenshot
(embedded in the xlsx, sheet `5.0 Promotions`) — it shows bold headings ("Terms &
Conditions", "Location/contact") and a repeated address list inside the article body, which
a flat string can't represent. `blocks` stores a typed JSON node tree (`paragraph`,
`heading`, `list`, inline `bold`) instead of HTML/markdown — safer (no raw-HTML injection
surface) and matches Strapi's native admin editor.

```json
[
  { "type": "paragraph", "children": [{ "type": "text", "text": "Plain paragraph." }] },
  { "type": "heading", "level": 3, "children": [{ "type": "text", "text": "A heading" }] },
  { "type": "list", "format": "unordered", "children": [
    { "type": "list-item", "children": [{ "type": "text", "text": "Item one" }] }
  ]},
  { "type": "paragraph", "children": [
    { "type": "text", "text": "Normal, " },
    { "type": "text", "text": "bold part", "bold": true },
    { "type": "text", "text": "." }
  ]}
]
```

FE consequence: no first-party Strapi renderer for React Native — needs a small custom
walker over this node tree (`@strapi/blocks-react-renderer` exists for React web only).

## 8. Gotchas / things that look like bugs but aren't

- **`?country=ID,MY` returns nothing.** Country is a single-value tab, not a filter — csv
  isn't parsed for it (unlike `tags`). Matches FSD; not a bug.
- **Relation writes go through a custom `create`/`update`, not the stock Strapi action.**
  Every route in this repo is `auth:false`, which means Strapi's `authenticate()` middleware
  never sets `ctx.state.auth` — so the stock content-API sanitizer's relation-write check
  (which needs an auth context to verify permissions) always rejects `tags`
  (`"Invalid key tags"`), regardless of what Public-role permissions exist. Both
  `promotion-article` and `promotion-tag` controllers bypass the sanitizer and call the
  Document Service directly instead — same trust model already in place on every other
  route in this repo. First time this surfaced because `tags` is the first relation field
  anywhere in this codebase.
- **Direct Document Service writes default to draft.** Unlike the stock factory `create`
  (which auto-publishes), `strapi.documents(uid).create({data})` alone leaves
  `publishedAt: null`. Both custom controller actions and the seed script explicitly pass
  `status: "published"` / call `.publish()` to match this repo's existing "write = live"
  behavior.
