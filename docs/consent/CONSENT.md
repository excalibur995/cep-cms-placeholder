# Consent — Developer Guide

This guide explains how the **Consent** feature works, how to run it locally with
**Azurite** (a free local Azure Blob Storage emulator), and how the frontend
consumes it.

---

## 1. Overview

Consent documents (Terms & Conditions, RIPLAY, etc.) are managed in the CMS and
served to the app. There are **two types**:

| Type      | What it stores        | How the FE renders it            |
| --------- | --------------------- | -------------------------------- |
| `dynamic` | Rich HTML content     | Render the returned `html`       |
| `static`  | An uploaded PDF asset | Open the returned `fileUrl` (PDF)|

Static files are **not** kept on the Strapi server. They are stored in
**Azure Blob Storage** (emulated locally by Azurite). Strapi only keeps the file
**metadata**; the binary lives in the blob container.

For static consent, the API never exposes the Azure URL. Instead it returns a
**proxy URL on the CMS domain**, and the CMS streams the PDF from Azure
server-side. See [Proxy URL flow](#5-static-files--proxy-url-flow).

---

## 2. Prerequisites

- Node.js (v20+) and **npm**
- Dependencies installed: `npm install`
- **Azurite** for local blob storage (below)

---

## 3. Local setup — Azurite

Azurite emulates Azure Blob Storage on your machine. It is free and requires no
Azure account.

### 3.1 Install

```bash
npm install -g azurite
```

### 3.2 Run (Blob service only)

```bash
mkdir -p ~/azurite-data
azurite-blob --silent --skipApiVersionCheck --location ~/azurite-data
```

- Blob endpoint: `http://127.0.0.1:10000`
- `--skipApiVersionCheck` avoids an API-version mismatch between the Azure SDK
  and the emulator. Only needed for Azurite, not real Azure.
- **Start Azurite before Strapi** so the container can be auto-created.

Azurite uses fixed well-known credentials (already set in `.env.example`):

| Key            | Value                                                            |
| -------------- | --------------------------------------------------------------- |
| Account name   | `devstoreaccount1`                                              |
| Account key    | `Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==` |
| Blob URL       | `http://127.0.0.1:10000/devstoreaccount1`                       |

### 3.3 Environment variables

Copy `.env.example` to `.env` and make sure the storage block is present:

```bash
STORAGE_AUTH_TYPE=default
STORAGE_ACCOUNT=devstoreaccount1
STORAGE_ACCOUNT_KEY=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==
STORAGE_URL=http://127.0.0.1:10000/devstoreaccount1
STORAGE_CONTAINER_NAME=cms-assets
STORAGE_CREATE_CONTAINER_IF_NOT_EXIST=true
STORAGE_PUBLIC_ACCESS_TYPE=blob
STORAGE_DEFAULT_PATH=assets
```

> **Fallback:** Remove/comment `STORAGE_ACCOUNT` to disable Azure and use
> Strapi's default local upload provider (`public/uploads`) instead.

### 3.4 Start Strapi

```bash
npm run dev
```

Boot order:

```
1. Azurite (:10000)  →  2. npm run dev (:1337)  →  3. open /admin
```

---

## 4. Using Consent in the Admin

1. **Content Manager → Consent → Create new entry**
2. Fill common fields:
   - `consentId` — stable identifier, e.g. `riplay-personal` (shared across versions)
   - `version` — integer, e.g. `1`
   - `type` — `dynamic` or `static`
3. The form shows fields conditionally:
   - `type = dynamic` → **htmlContent** editor appears
   - `type = static` → **file** upload appears (upload the PDF here)
4. **Save → Publish**

Uploaded PDFs go straight to the Azure/Azurite container `cms-assets`; the local
`public/uploads` folder stays empty when the Azure provider is active.

---

## 5. Static files — proxy URL flow

The FE never sees the Azure URL. The metadata endpoint returns a CMS proxy URL,
and a separate endpoint streams the bytes from Azure.

```
FE → GET /api/consents/:consentId
      → { fileUrl: "http://<cms>/api/consents/:consentId/file", fileName, fileMime }

FE → GET /api/consents/:consentId/file
      → CMS fetches the blob from Azure (server-side) and streams the PDF back
```

Benefits: Azure stays hidden, storage can be made private, and the FE just needs
a stable URL it can hand to a PDF viewer / `<iframe>` / download link.

---

## 6. API reference

Base path: `/api`

| Method | Path                          | Description                                    |
| ------ | ----------------------------- | ---------------------------------------------- |
| GET    | `/consents`                   | List published consents (normalized)           |
| GET    | `/consents/:consentId`        | Latest published version of a consent          |
| GET    | `/consents/:consentId/file`   | Stream the static PDF (proxy from storage)     |
| POST   | `/consents`                   | Create                                         |
| PUT    | `/consents/:id`               | Update                                         |
| DELETE | `/consents/:id`               | Delete                                         |

> `:consentId` resolves the **latest `version`** among published entries.
> `:id` (PUT/DELETE) is the Strapi document id.

### Response shape (normalized)

Both types return the same shape, so the client branches on `type`:

**Dynamic**
```json
{
  "consentId": "riplay-personal",
  "version": 3,
  "type": "dynamic",
  "title": "RIPLAY Personal",
  "html": "<h2>Terms…</h2>",
  "fileUrl": null,
  "fileName": null,
  "fileMime": null
}
```

**Static**
```json
{
  "consentId": "tnc-savings",
  "version": 2,
  "type": "static",
  "title": "T&C Savings Account",
  "html": null,
  "fileUrl": "http://localhost:1337/api/consents/tnc-savings/file",
  "fileName": "consent.pdf",
  "fileMime": "application/pdf"
}
```

### FE consumption

```ts
const res = await fetch(`/api/consents/${consentId}`);
const c = await res.json();

if (c.type === "dynamic") {
  render(c.html);            // render HTML
} else {
  openPdf(c.fileUrl);        // open/embed the PDF URL
}
```

---

## 7. How storage is wired (for reference)

| Concern                         | Location                                                        |
| ------------------------------- | --------------------------------------------------------------- |
| Which storage provider (Azure)  | `config/plugins.ts` (reads `STORAGE_*` env)                     |
| CSP allow-list for previews      | `config/middlewares.ts`                                         |
| Collection schema + conditions   | `src/api/consent/content-types/consent/schema.json`             |
| Type/content validation          | `src/api/consent/content-types/consent/lifecycles.ts`           |
| Normalization + proxy URL        | `src/api/consent/controllers/consent.ts` (`normalize`)          |
| PDF streaming endpoint           | `src/api/consent/controllers/consent.ts` (`streamFile`)         |
| Routes                           | `src/api/consent/routes/consent.ts`                             |

**Upload path:** the file transits the Strapi server in memory/temp during the
request, is streamed to Azure by the provider, then only its metadata (url,
name, mime, size) is saved in Strapi's DB. Nothing persists on the Strapi disk.

---

## 8. Verifying blobs in Azurite

List the container contents with the Azure SDK (installed with the provider):

```js
// scratch script
const { BlobServiceClient } = require("@azure/storage-blob");
const conn =
  "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;";
const svc = BlobServiceClient.fromConnectionString(conn);
(async () => {
  const container = svc.getContainerClient("cms-assets");
  for await (const b of container.listBlobsFlat()) console.log(b.name);
})();
```

Or use **Azure Storage Explorer** (free GUI) → *Attach to a local emulator*.

---

## 9. Moving to real Azure (dev/prod)

No code changes needed — only env:

1. Set `STORAGE_ACCOUNT` / `STORAGE_ACCOUNT_KEY` from the Azure Portal.
2. **Remove `STORAGE_URL`** so it defaults to
   `https://<account>.blob.core.windows.net`.
3. Drop `--skipApiVersionCheck` (Azurite-only).
4. For a deployed environment, set `PUBLIC_URL` and read it in
   `config/server.ts` (`url: env('PUBLIC_URL')`) so proxy URLs are absolute.

---

## 10. Troubleshooting

| Symptom                                             | Fix                                                             |
| --------------------------------------------------- | -------------------------------------------------------------- |
| `The API version … is not supported by Azurite`     | Run Azurite with `--skipApiVersionCheck`, or upgrade Azurite   |
| `EADDRINUSE: … 10001`                               | Use `azurite-blob` (Blob only) instead of full `azurite`       |
| `The port 1337 is already used`                     | Another Strapi is running — stop it before `npm run dev`       |
| Upload lands in `public/uploads`, not Azure         | `STORAGE_ACCOUNT` is unset/empty — check `.env`                |
| `/consents/:id/file` returns 404                    | Entry not `static`, not published, or has no file              |
| `/consents/:id/file` returns 502                    | Storage (Azurite/Azure) is unreachable                         |
