/**
 * consent controller
 *
 * Normalizes both consent types into one shape so the client doesn't have to
 * branch on storage details:
 *  - dynamic -> `html` carries the rendered content, file fields are null
 *  - static  -> `fileUrl` points at a CMS proxy endpoint that streams the PDF
 *
 * The proxy keeps the underlying storage (Azure Blob / Azurite / local) hidden
 * from the client: the FE only ever sees a URL on the CMS domain, and the CMS
 * fetches the actual bytes server-side in `streamFile`.
 */

import { Readable } from "node:stream";
import { factories } from "@strapi/strapi";

type ConsentEntity = {
  consentId?: string;
  version?: number;
  type?: "dynamic" | "static";
  title?: string;
  locale?: string;
  effectiveDate?: string;
  htmlContent?: string;
  file?: { url?: string; name?: string; mime?: string; size?: number } | null;
};

function toAbsoluteUrl(url: string | undefined | null, baseUrl: string) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url; // provider already returns absolute (e.g. Azure)
  return `${baseUrl.replace(/\/$/, "")}${url}`;
}

function normalize(entity: ConsentEntity, baseUrl: string) {
  const isStatic = entity.type === "static";
  return {
    consentId: entity.consentId ?? null,
    version: entity.version ?? null,
    type: entity.type ?? null,
    title: entity.title ?? null,
    locale: entity.locale ?? null,
    effectiveDate: entity.effectiveDate ?? null,
    html: entity.type === "dynamic" ? entity.htmlContent ?? null : null,
    // Proxy URL on the CMS domain — the storage backend stays hidden.
    fileUrl:
      isStatic && entity.file?.url
        ? `${baseUrl.replace(/\/$/, "")}/api/consents/${entity.consentId}/file`
        : null,
    fileName: isStatic ? entity.file?.name ?? null : null,
    fileMime: isStatic ? entity.file?.mime ?? null : null,
  };
}

function resolveBaseUrl(strapi: unknown, ctx: { request: { origin: string } }) {
  return (
    ((strapi as { config: { get: (k: string) => unknown } }).config.get(
      "server.url",
    ) as string) || ctx.request.origin
  );
}

async function findLatest(strapi: any, consentId: string) {
  const results = (await strapi.documents("api::consent.consent").findMany({
    filters: { consentId: { $eq: consentId } },
    sort: [{ version: "desc" }],
    limit: 1,
    status: "published",
    populate: ["file"],
  })) as ConsentEntity[];
  return results[0];
}

export default factories.createCoreController(
  "api::consent.consent",
  ({ strapi }) => ({
    async find(ctx) {
      const { sort, filters, locale, pagination } = (ctx.query ?? {}) as Record<
        string,
        unknown
      >;
      const baseUrl = resolveBaseUrl(strapi, ctx);
      const results = (await strapi
        .documents("api::consent.consent")
        .findMany({
          status: "published",
          populate: ["file"],
          ...(sort ? { sort: sort as never } : {}),
          ...(filters ? { filters: filters as never } : {}),
          ...(locale ? { locale: locale as string } : {}),
        })) as ConsentEntity[];
      const page = (pagination as Record<string, unknown>) ?? {};
      return {
        data: results.map((entity) => normalize(entity, baseUrl)),
        meta: {
          pagination: {
            page: page.page ?? 1,
            pageSize: page.pageSize ?? results.length,
            total: results.length,
          },
        },
      };
    },

    async findByConsentId(ctx) {
      const { consentId } = ctx.params as { consentId: string };
      const baseUrl = resolveBaseUrl(strapi, ctx);
      const entity = await findLatest(strapi, consentId);
      if (!entity) return ctx.notFound();
      return normalize(entity, baseUrl);
    },

    // Streams the static consent PDF from storage, hiding the backend from the FE.
    async streamFile(ctx) {
      const { consentId } = ctx.params as { consentId: string };
      const baseUrl = resolveBaseUrl(strapi, ctx);
      const entity = await findLatest(strapi, consentId);
      if (!entity || entity.type !== "static" || !entity.file?.url) {
        return ctx.notFound();
      }

      const source = toAbsoluteUrl(entity.file.url, baseUrl);
      const upstream = await fetch(source as string);
      if (!upstream.ok || !upstream.body) {
        return ctx.throw(502, "Failed to fetch consent file from storage");
      }

      ctx.set("Content-Type", entity.file.mime ?? "application/octet-stream");
      ctx.set(
        "Content-Disposition",
        `inline; filename="${entity.file.name ?? "consent"}"`,
      );
      const contentLength = upstream.headers.get("content-length");
      if (contentLength) ctx.set("Content-Length", contentLength);
      ctx.body = Readable.fromWeb(upstream.body as never);
    },
  }),
);
