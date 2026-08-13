# Promotions (5.0) — Filter & Sort Spec

Drill-down on `docs/REWARDS_CMS_REQUIREMENTS.md` §7. Scope: **FSD 5.0 Promotions tab** only
— the six filterable/sortable mechanisms on the Promotions List screen. For each: does it
live in Strapi, FE, or neither; what content-type field(s) serve it; how filter/sort is
actually implemented.

---

## Content-types: `promotion-article` + `promotion-tag`

One row per article (not a json blob container like `product` — needs per-row filter/sort,
so real typed fields, not an opaque json field). **`tags` is a relation** (not json) — native
Strapi relation filtering (`$in` on a real FK) is DB-reliable across sqlite/mysql/postgres,
unlike json `$contains`, and it structurally prevents tag typos. **`countries` stays a plain
json enum-array** — 5 fixed values defined by the FSD itself (ID/MY/SG/PH/KH), never
admin-authored, never growing; a relation collection for 5 static rows is pure overhead.

```json
// promotion-tag
{
  "kind": "collectionType",
  "collectionName": "promotion_tags",
  "info": {
    "singularName": "promotion-tag",
    "pluralName": "promotion-tags",
    "displayName": "Promotion Tag"
  },
  "options": { "draftAndPublish": false },
  "pluginOptions": { "i18n": { "localized": true } },
  "attributes": {
    "tagCode": { "type": "string", "required": true, "unique": true },
    "tagName": { "type": "string", "required": true }
  }
}
```

```json
// promotion-article
{
  "kind": "collectionType",
  "collectionName": "promotion_articles",
  "info": {
    "singularName": "promotion-article",
    "pluralName": "promotion-articles",
    "displayName": "Promotion Article"
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": { "i18n": { "localized": true } },
  "attributes": {
    "promotionArticleId": { "type": "string", "required": true, "unique": true },
    "title": { "type": "string", "required": true, "maxLength": 26 },
    "shortDescription": { "type": "string", "maxLength": 63 },
    "bodyContent": { "type": "text", "maxLength": 1200 },
    "image": { "type": "string" },
    "tags": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::promotion-tag.promotion-tag"
    },
    "countries": { "type": "json" },
    "recommended": { "type": "boolean", "default": false },
    "publishedDate": { "type": "datetime", "required": true },
    "startDate": { "type": "datetime", "required": true },
    "endDate": { "type": "datetime", "required": true },
    "learnMoreType": { "type": "enumeration", "enum": ["web-viewer", "in-app"] },
    "learnMoreLink": { "type": "string" }
  }
}
```

`tagName` is localized (display copy, e.g. "Credit cards" translated per locale); `tagCode` is
the stable key the relation and filters key off, same across locales.

| Field | Purpose | Serves section(s) |
|---|---|---|
| `title` | display + search target | §2 |
| `tags` | relation → `promotion-tag`, max 3 assigned, cater 5 displayed | §3 |
| `countries` | `("ID"\|"MY"\|"SG"\|"PH"\|"KH")[]`, plain json | §1, §5 |
| `recommended` | admin-set flag, explicitly called out in FSD as CMS-editable | §4, §5 |
| `publishedDate` | Newest-sort key | §5 |
| `startDate`/`endDate` | active window + Ending-soon key | §5 (and always-on active filter) |
| `promotionArticleId` | key, triggers existing webhook (`*Id` auto-detect) | infra |

Note on repo convention: CLAUDE.md documents the Product Catalog as *"keyed by codes rather
than relations"* — a deliberate choice there because that catalog is a blob-aggregation model
(one row holds many nested items in json). `promotion-article` is one-row-per-article, the
normal shape relations are built for, so using a real relation for `tags` doesn't fight that
convention, it's just a different content shape.

---

## Section-by-section

### 1. Country tabs
**Applicable: Strapi (filter) + FE (tab chrome).**
Tab list itself (`All, ID, MY, SG, PH, KH`, fixed order) is a **hardcoded FE constant** — not
CMS-driven, FSD gives no "retrieve tab list" remark for it. Strapi's job is narrower: accept
`?country=ID` and filter `countries` array-contains (`All` = no filter).
- **Filter:** in-memory `article.countries.includes(country)` after the DB fetch (see §5 for why in-memory).
- **Sort:** N/A here — sort is §5, this is just which subset shows.

### 2. Search
**Applicable: Strapi (query) + FE (gate).**
Title-only match, **min 2 characters** before any API call. FE owns the 2-char gate (no
request fires below it) — Strapi should still no-op defensively if `search.length < 2` slips
through, rather than full-scanning.
- FSD says "fuzzy search algorithm" — plain Strapi `$containsi` is **substring match, not true
  fuzzy/typo-tolerant**. Flag this as a gap: if the bank means literal fuzzy (edit-distance/
  typo tolerance), that's custom scoring logic in the controller, not a filter param. If
  "fuzzy" just means "partial/substring, case-insensitive," `$containsi` covers it. **Confirm
  with the FSD owner before building** — cheap to get wrong either direction.
- **Filter:** `filters: { title: { $containsi: search } }` — this one CAN be pushed to the DB (plain string field, not json).

### 3. Category filter
**Applicable: Strapi (relation + filter + pill source) + FE ("All" toggle, show more/less UI).**
`tags` is a `promotion-tag` relation (see content-types above) — `GET /promotion-tags` is a
stock Strapi list endpoint, free. But FSD is explicit the **pills** shown are narrower than the
full tag table: *"category filter pills will not be a fixed value, it will be displayed based
on the published article tags"* — i.e. only tags currently **in use on published, active
articles**, alpha-sorted. So the pill source is a small custom query (or a `populate` +
`filters` on `promotion-tag` scoped by its relation back to active articles), not a plain
`GET /promotion-tags`. FE handles the "first 10 + Show more/less" slice.
- **Filter:** `?tags=codeA,codeB` → native relation filter, `filters: { tags: { tagCode: { $in: selected } } }` — DB-pushable, no in-memory fallback needed. "All" checkbox = FE clears the param entirely, not a special server value.

### 4. Sort (bottomsheet UI)
**Applicable: mostly FE, trivial Strapi.**
The 3 options (`Recommended` default → `Ending soon` → `Newest`) are a **fixed, hardcoded
order** — FSD's CMS remark is only "retrieve drawer title," not "retrieve sort options," so the
option list itself isn't CMS-configurable. FE renders the drawer + radio state and picks the
`sort` param value; Strapi just accepts the enum. Drawer *title* copy is CMS (`i18n-content`),
the options themselves are not.
- **Filter:** N/A.
- **Sort:** param passthrough into §5's algorithm.

### 5. Business Rule #10 — the actual sort algorithm
**Applicable: Strapi only.** This is the one genuinely backend-owned piece — FE cannot compute
it because the country-count tiering needs the full active dataset, not a page slice.
- Shared skeleton across all three sort modes when `country=All`: bucket by **applicable-country
  count descending (5→1)**, within the 1-country bucket order by fixed priority
  **ID > MY > SG > PH > KH**, then apply the mode-specific tiebreak, then alphabetical by title
  as final tiebreak.
- Mode-specific tiebreak: `recommended`/`newest` → `publishedDate` desc; `ending-soon` →
  `endDate` asc.
- Single-country tab (`country=ID` etc.): skip the count-tiering, just 2-key sort
  (mode-tiebreak, then title alpha) over that country's articles.
- **Implementation:** `strapi.documents(UID).findMany({ filters: { publishedAt: {$notNull:true}, startDate:{$lte:now}, endDate:{$gte:now}, title:{$containsi:search}, tags:{tagCode:{$in:selected}} }, populate: ['tags'] })` pushes status + date window + search + tag filter to the DB (all now DB-native — tags included, since it's a relation). Only `countries` (plain json enum-array) still needs an in-memory `.filter()` pass after fetch. Then in-memory: comparator per mode (country-count tiering + tiebreak). Same shape as the existing `product.findAggregated` controller (fetch, then JS-side sort) — not new architecture for this repo, just a smaller in-memory slice than before.

### 6. Business Rule #4 — Geolocation default tab
**Not applicable to Strapi.** Zero backend role. FE detects device/app location permission and
picks which `country` value to request *first* on screen load (ID→ID tab, MY→MY tab, etc.).
Strapi already supports whatever country FE sends via §1 — no separate endpoint or field needed.

---

## Summary table

| # | Mechanism | Strapi | FE | Notes |
|---|---|---|---|---|
| 1 | Country tabs | ✅ filter param (in-memory, json enum-array) | ✅ tab list (hardcoded) | tab order not CMS-driven; no country relation |
| 2 | Search | ✅ `$containsi` on title (DB-native) | ✅ 2-char gate | confirm "fuzzy" meaning before building |
| 3 | Category filter | ✅ relation filter (DB-native) + pill-source query | ✅ "All" toggle, show more/less | `promotion-tag` relation, pills scoped to tags-in-use |
| 4 | Sort drawer | ⚪ passthrough only | ✅ UI + option list (hardcoded) | drawer title is CMS copy, options aren't |
| 5 | Sort algorithm (Rule #10) | ✅ **owns this entirely** | — | can't be computed client-side (needs full dataset) |
| 6 | Geolocation default tab | ❌ not applicable | ✅ **owns this entirely** | just picks which `country` param to send |

**Extra endpoints (per this revision):**
- `GET /promotion-tags` — stock Strapi list, all tags (admin/authoring use).
- pill-source query (§3) — tags in use on published+active articles only, not the full table.
- `GET /promotion-articles/countries` — static endpoint, returns the fixed 5-tuple `[ID,MY,SG,PH,KH]` in FSD order. No DB query; exists purely so FE has one place to fetch it instead of hardcoding twice.

---

*Companion to `docs/REWARDS_CMS_REQUIREMENTS.md` — see §6 for the full field spec and §9 open
questions (esp. sqlite vs. prod JSON filtering behavior, still unresolved).*
