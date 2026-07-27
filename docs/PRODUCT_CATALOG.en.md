# Product Catalog & CMS Changes

This document summarizes the changes made on the `feat/poc-new-structure` branch:
the new **Product Catalog** (the `product-group`, `product-category`, and `product` collections),
custom fields & a custom admin page in Strapi, plus adjustments to existing collections
(`i18n-content`, `notification-template`).

Stack: **Strapi v5.45.0**, package manager **pnpm 9.15.3**.

---

## Table of Contents

1. [Change Summary](#1-change-summary)
2. [Product Catalog Data Architecture](#2-product-catalog-data-architecture)
3. [Collection Type Schemas](#3-collection-type-schemas)
4. [REST API & Sample Responses](#4-rest-api--sample-responses)
5. [Custom Fields & Admin Customization](#5-custom-fields--admin-customization)
6. [Changes to Existing Collections](#6-changes-to-existing-collections)
7. [Technical Notes](#7-technical-notes)

---

## 1. Change Summary

| Area | Change |
|------|--------|
| **New collections** | `product-group`, `product-category`, `product` |
| **Custom fields** | `product-group-code`, `product-category-code` (searchable dropdowns), `parent-language-id` |
| **Admin page** | **Product Catalog** menu with sub-navigation to the 3 collections |
| **Custom controllers** | Aggregation & lookup endpoints (`/aggregated-products`, `/product-categories/codes`, etc.) |
| **Field labels & list layouts** | Applied automatically on bootstrap (`src/lib/admin`) |
| **`i18n-content`** | `find` overridden: `moduleId` shorthand + response grouped per locale |
| **`notification-template`** | `parentLanguageId` now uses the `parent-language-id` custom field |
| **Tooling** | `packageManager` (pnpm) added; `.env.example` removed |

---

## 2. Product Catalog Data Architecture

The Product Catalog consists of 3 collections related to each other through **codes**
(not Strapi relations), keeping it flexible and easy for downstream APIs to consume:

```
product-group  ──(productGroupCode)──▶  product-category  ──(productCategoryCode)──▶  product
   screenId                                 productGroupCode                              productGroupCode
   moduleId                                 categories[]                                  productCategoryCode
   groups[]                                                                               data{ products[] }
```

- **`product-group`** — keyed by `(screenId, moduleId)`. The JSON field `groups` holds the
  array of product groups for that screen/module combination.
- **`product-category`** — keyed by `productGroupCode` (unique). The JSON field `categories`
  holds the category array belonging to that group.
- **`product`** — keyed by `(productGroupCode, productCategoryCode)`. The JSON field `data`
  stores the aggregated payload verbatim, i.e. a `{ products: [...] }` object.

All three enable **Draft & Publish**. Every public endpoint reads `published` data only.

---

## 3. Collection Type Schemas

### 3.1 `product-group`
`src/api/product-group/content-types/product-group/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "product_groups",
  "info": { "singularName": "product-group", "pluralName": "product-groups", "displayName": "Product Group" },
  "options": { "draftAndPublish": true },
  "attributes": {
    "screenId": { "type": "string", "required": true },
    "moduleId": { "type": "string", "required": true },
    "groups":   { "type": "json",   "required": true }
  }
}
```

### 3.2 `product-category`
`src/api/product-category/content-types/product-category/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "product_categories",
  "info": { "singularName": "product-category", "pluralName": "product-categories", "displayName": "Product Category" },
  "options": { "draftAndPublish": true },
  "attributes": {
    "productGroupCode": {
      "type": "customField",
      "customField": "global::product-group-code",
      "required": true,
      "unique": true
    },
    "categories": { "type": "json", "required": true }
  }
}
```

### 3.3 `product`
`src/api/product/content-types/product/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "products",
  "info": { "singularName": "product", "pluralName": "products", "displayName": "Product" },
  "options": { "draftAndPublish": true },
  "attributes": {
    "productGroupCode":    { "type": "customField", "customField": "global::product-group-code",    "required": true },
    "productCategoryCode": { "type": "customField", "customField": "global::product-category-code", "required": true },
    "data":                { "type": "json", "required": true }
  }
}
```

> The `productGroupCode` & `productCategoryCode` fields use **custom fields** so the admin
> renders them as searchable dropdowns (see [section 5](#5-custom-fields--admin-customization)),
> while the stored value remains a plain code string.

---

## 4. REST API & Sample Responses

All endpoints below use `config: { auth: false }` (public, no token required). Strapi's default
prefix is `/api`.

### 4.1 Product Group — `src/api/product-group`

| Method | Path | Handler | Notes |
|--------|------|---------|-------|
| GET | `/api/product-groups/codes` | `findCodes` | Distinct `{ productGroupCode, productGroupName }` |
| GET | `/api/product-groups` | `find` | List; optional filters `screenId` / `moduleId` |
| POST | `/api/product-groups` | `create` | Core create |
| PUT | `/api/product-groups/:id` | `update` | Core update |
| DELETE | `/api/product-groups/:id` | `delete` | Core delete |

**`GET /api/product-groups?screenId=..&moduleId=..`** — if both keys are present → returns a
single entry (find by id); otherwise → lists all entries. The `groups` array is always sorted
by `displayOrder`.

Response (single entry):
```json
{
  "screenId": "home",
  "moduleId": "productModule",
  "groups": [
    { "productGroupCode": "PG001", "productGroupName": "Savings", "displayOrder": 1 },
    { "productGroupCode": "PG002", "productGroupName": "Loans",   "displayOrder": 2 }
  ]
}
```

**`GET /api/product-groups/codes`**
```json
[
  { "productGroupCode": "PG001", "productGroupName": "Savings" },
  { "productGroupCode": "PG002", "productGroupName": "Loans" }
]
```

### 4.2 Product Category — `src/api/product-category`

| Method | Path | Handler | Notes |
|--------|------|---------|-------|
| GET | `/api/product-categories/codes` | `findCodes` | Distinct `{ productCategoryCode, productCategoryName, productGroupCode }` |
| GET | `/api/product-categories` | `find` | List; optional filter `productGroupCode` |
| POST | `/api/product-categories` | `create` | Core create |
| PUT | `/api/product-categories/:id` | `update` | Core update |
| DELETE | `/api/product-categories/:id` | `delete` | Core delete |

**`GET /api/product-categories?productGroupCode=PG001`** — if `productGroupCode` is present →
returns the **categories array** for that group (404 if none); otherwise → lists all entries
(each wrapped with its `productGroupCode`). Always sorted by `displayOrder`.

Response (with `productGroupCode`):
```json
[
  { "productCategoryCode": "PC001", "productCategoryName": "Regular Savings", "productGroupCode": "PG001", "displayOrder": 1 },
  { "productCategoryCode": "PC002", "productCategoryName": "Premium Savings",  "productGroupCode": "PG001", "displayOrder": 2 }
]
```

Response (no filter):
```json
[
  { "productGroupCode": "PG001", "categories": [ { "productCategoryCode": "PC001", "...": "..." } ] }
]
```

### 4.3 Product — `src/api/product`

| Method | Path | Handler | Notes |
|--------|------|---------|-------|
| GET | `/api/aggregated-products` | `findAggregated` | Aggregated payload; filters `productGroupCode` / `productCategoryCode` |
| GET | `/api/products/:productId` | `findByProductId` | Single product by `product.productId` |
| POST | `/api/products` | `create` | Core create |
| PUT | `/api/products/:id` | `update` | Core update |
| DELETE | `/api/products/:id` | `delete` | Core delete |

**`GET /api/aggregated-products?productGroupCode=PG001&productCategoryCode=PC001`**
If **both** codes are present → returns that entry's `data` object verbatim (find by id, 404 if
not found). Otherwise → merges the `products` across all entries into `{ products: [...] }`,
sorted by `product.displayOrder`.

Response (both codes):
```json
{
  "products": [
    { "product": { "productId": "P123", "displayOrder": 1, "name": "eSaver" } },
    { "product": { "productId": "P124", "displayOrder": 2, "name": "Time Deposit" } }
  ]
}
```

**`GET /api/products/:productId`** — searches inside every entry's `data.products`; returns the
first item whose `product.productId` matches (404 if none).
```json
{ "product": { "productId": "P123", "displayOrder": 1, "name": "eSaver" } }
```

---

## 5. Custom Fields & Admin Customization

### 5.1 Custom field registration
- **Server** (`src/index.ts`, `register`): registers the base `string` type for
  `template-id`, `parent-language-id`, `product-group-code`, `product-category-code`.
- **Admin** (`src/admin/app.tsx`, `register`): registers the input component for each custom field.

### 5.2 Input components (searchable dropdowns)
`src/admin/components/`

| Component | Data source | Used by |
|-----------|-------------|---------|
| `ProductGroupCodeInput.tsx` | `GET /api/product-groups/codes` | `product-category.productGroupCode`, `product.productGroupCode` |
| `ProductCategoryCodeInput.tsx` | `GET /api/product-categories/codes` | `product.productCategoryCode` |
| `ParentLanguageIdInput.tsx` | content-manager locale | `notification-template.parentLanguageId` |
| `TemplateIdInput.tsx` | auto-generated UUID | `notification-template.templateId` |

Components use `Combobox` from `@strapi/design-system`. The stored value stays a plain code
string — the data model is unchanged. The current value remains selectable even if it's not yet
in the fetched list (so an existing entry never shows an empty dropdown).

### 5.3 The "Product Catalog" admin page
`src/admin/pages/ProductCatalog/index.tsx` — adds a menu link (`app.addMenuLink`) in
`src/admin/app.tsx`. The page shows sub-navigation to the Content Manager list view of all three
collections, so editing still uses Strapi's native tooling (filters, draft/publish, labels).

### 5.4 Automatic field labels & list layouts
`src/lib/admin/` — run on `bootstrap` (`src/index.ts`):

- **`field-labels.ts`** + **`labels/`** — rewrites Content Manager labels (e.g. `pushTitle1` →
  "Push Title 1"). Labels are declared explicitly per content type under `labels/`. Because the
  configuration lives in the core store, this is applied on every bootstrap to keep all
  environments in sync (**consequence**: label edits made via the admin UI are overwritten).
- **`list-layouts.ts`** — defines the list-view columns per collection. Like labels, column
  changes made via the admin UI are overwritten on bootstrap.

List columns applied:

| Collection | Columns |
|------------|---------|
| `product-group` | `id`, `screenId`, `moduleId`, `updatedAt` |
| `product-category` | `id`, `productGroupCode`, `updatedAt` |
| `product` | `id`, `productGroupCode`, `productCategoryCode`, `updatedAt` |

---

## 6. Changes to Existing Collections

### 6.1 `i18n-content` — `find` override
`src/api/i18n-content/controllers/i18n-content.ts`

- **`moduleId` shorthand**: `?moduleId=accountDashboard` is automatically translated into
  `filters[moduleId][$eq]=accountDashboard`.
- **Grouping per locale**: if `locale` is not specified (or `locale=all`), the response is
  returned grouped by every configured locale (`en`, `id`, ...). If a specific locale is
  requested, Strapi's default behavior is preserved.

Response (no specific locale):
```json
{
  "data": {
    "en": { "moduleId": "accountDashboard", "...": "..." },
    "id": { "moduleId": "accountDashboard", "...": "..." }
  },
  "meta": { "locales": ["en", "id"] }
}
```

### 6.2 `notification-template`
`src/api/notification-template/content-types/notification-template/schema.json` — the
`parentLanguageId` field now uses the `global::parent-language-id` custom field (defaults to the
locale selected in the content manager).

---

## 7. Technical Notes

- **Package manager**: `packageManager: pnpm@9.15.3` added in `package.json`; use `pnpm install`
  (lockfile `pnpm-lock.yaml`).
- **`.env.example`** removed — configure environment variables manually per the Strapi docs.
- **Auth**: all Product Catalog routes use `auth: false` (public). Revisit before production if
  the data is sensitive.
- **Code-based relations**: relations between collections don't use Strapi relations but string
  codes (`productGroupCode`, `productCategoryCode`), so there is no automatic referential
  integrity — code consistency is enforced through the custom-field dropdowns.
- **Types**: `types/generated/contentTypes.d.ts` is regenerated automatically by Strapi to match
  the new schemas.
