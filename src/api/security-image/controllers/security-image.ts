/**
 * security-image controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::security-image.security-image",
  ({ strapi }) => ({
    async find(ctx) {
      const cdnUrl = process.env.CDN_URL ?? "";
      const { pagination } = (ctx.query ?? {}) as Record<string, unknown>;
      const results = await strapi
        .documents("api::security-image.security-image")
        .findMany({ status: "published" });
      const page = (pagination as Record<string, unknown>) ?? {};
      return {
        data: results.map((e) => `${cdnUrl}/security-images/${e.filename}`),
        meta: {
          pagination: {
            page: page.page ?? 1,
            pageSize: page.pageSize ?? results.length,
            total: results.length,
          },
        },
      };
    },
  }),
);
