import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::navigator.navigator", ({ strapi }) => ({
  async find(ctx) {
    const results = await strapi.documents("api::navigator.navigator").findMany({
      status: "published",
    });
    return {
      data: results,
      meta: {
        pagination: { page: 1, pageSize: results.length, total: results.length },
      },
    };
  },
  async findBySubJourney(ctx) {
    const { subJourneyId } = ctx.params as { subJourneyId: string };

    const results = await strapi.documents("api::navigator.navigator").findMany({
      filters: { subJourneyId: { $eq: subJourneyId } },
      status: "published",
      limit: 1,
    });

    const entry = results[0];
    if (!entry) return ctx.notFound();

    return { data: entry.screens, meta: {} };
  },
}));
