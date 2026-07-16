/**
 * receipt-template controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::receipt-template.receipt-template",
  ({ strapi }) => ({
    async find(ctx) {
      const { sort, filters, locale, pagination } = (ctx.query ?? {}) as Record<
        string,
        unknown
      >;
      const results = await strapi
        .documents("api::receipt-template.receipt-template")
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

    async findByReceiptTemplateId(ctx) {
      const { receiptTemplateId } = ctx.params as { receiptTemplateId: string };
      const results = await strapi
        .documents("api::receipt-template.receipt-template")
        .findMany({
          filters: { receiptTemplateId: { $eq: receiptTemplateId } },
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
