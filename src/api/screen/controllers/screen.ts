/**
 * screen controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::screen.screen",
  ({ strapi }) => ({
    async find(ctx) {
      const { sort, filters, locale, pagination } = (ctx.query ?? {}) as Record<
        string,
        unknown
      >;
      const results = await strapi
        .documents("api::screen.screen")
        .findMany({
          status: "published",
          ...(sort ? { sort: sort as never } : {}),
          ...(filters ? { filters: filters as never } : {}),
          ...(locale ? { locale: locale as string } : {}),
        });
      const page = (pagination as Record<string, unknown>) ?? {};
      return {
        data: results,
        meta: {
          pagination: {
            page: page.page ?? 1,
            pageSize: page.pageSize ?? results.length,
            total: results.length,
          },
        },
      };
    },

    async findByScreenId(ctx) {
      const { journeyId } = ctx.params as { journeyId: string };
      const results = await strapi
        .documents("api::screen.screen")
        .findMany({
          filters: { journeyId: { $eq: journeyId } },
          sort: [{ version: "desc" }],
          limit: 1,
          status: "published",
        });
      const entity = results[0];
      if (!entity) return ctx.notFound();
      return entity;
    },
  }),
);
