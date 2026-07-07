/**
 * stp-screen controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::stp-screen.stp-screen", ({ strapi }) => ({
  async find(ctx) {
    const { pagination, ...rest } = (ctx.query ?? {}) as Record<string, unknown>;
    const results = await strapi.documents("api::stp-screen.stp-screen").findMany({
      status: "published",
      ...rest,
    });
    const page = (pagination as Record<string, unknown>) ?? {};
    return {
      data: results,
      meta: { pagination: { page: page.page ?? 1, pageSize: page.pageSize ?? results.length, total: results.length } },
    };
  },

  async findByScreenId(ctx) {
    const { screenId } = ctx.params as { screenId: string };

    const results = await strapi.documents("api::stp-screen.stp-screen").findMany({
      filters: { screenId: { $eq: screenId } },
      sort: [{ version: "desc" }],
      limit: 1,
      status: "published",
    });
    const entity = results[0];
    if (!entity) return ctx.notFound();
    return entity;
  },
}));
