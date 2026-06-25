import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::options-group.options-group", ({ strapi }) => ({
  async find(ctx) {
    const results = await strapi.documents("api::options-group.options-group").findMany({
      populate: { items: true },
      status: "published",
    });
    return results.map((group) => ({
      slug: group.slug,
      items: ((group.items ?? []) as Array<{ displayValue: string; value: string }>).map(({ displayValue, value }) => ({
        displayValue,
        value,
      })),
    }));
  },

  async findBySlug(ctx) {
    const { slug } = ctx.params as { slug: string };
    const results = await strapi.documents("api::options-group.options-group").findMany({
      filters: { slug: { $eq: slug } },
      populate: { items: true },
      status: "published",
      limit: 1,
    });
    const group = results[0];
    if (!group) return ctx.notFound();
    return ((group.items ?? []) as Array<{ displayValue: string; value: string }>).map(({ displayValue, value }) => ({
      displayValue,
      value,
    }));
  },
}));
