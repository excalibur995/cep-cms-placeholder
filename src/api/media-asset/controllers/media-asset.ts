/**
 * media-asset controller
 */

import { factories } from "@strapi/strapi";

const buildEntryData = (mediaId: string, list: unknown) => {
  if (list && typeof list === "object" && !Array.isArray(list)) {
    return { mediaId, ...(list as Record<string, unknown>) };
  }
  return { mediaId, list: list ?? [] };
};

export default factories.createCoreController(
  "api::media-asset.media-asset",
  ({ strapi }) => ({
    async find(ctx) {
      const { pagination } = (ctx.query ?? {}) as Record<string, unknown>;
      const results = await strapi
        .documents("api::media-asset.media-asset")
        .findMany({ status: "published" });
      const page = (pagination as Record<string, unknown>) ?? {};
      return {
        data: results.map((e) => buildEntryData(e.mediaId, e.list)),
        meta: {
          pagination: {
            page: page.page ?? 1,
            pageSize: page.pageSize ?? results.length,
            total: results.length,
          },
        },
      };
    },

    async findByMediaId(ctx) {
      const { mediaId } = ctx.params as { mediaId: string };
      const results = await strapi
        .documents("api::media-asset.media-asset")
        .findMany({
          filters: { mediaId: { $eq: mediaId } },
          status: "published",
        });
      const entry = results[0];
      if (!entry) {
        return ctx.notFound();
      }
      return {
        data: buildEntryData(entry.mediaId, entry.list),
      };
    },
  }),
);
