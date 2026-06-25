import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::navigator.navigator",
  ({ strapi }) => ({
    async findBySubJourney(ctx) {
      const { subJourneyId } = ctx.params as { subJourneyId: string };

      const results = await strapi
        .documents("api::navigator.navigator")
        .findMany({
          filters: { subJourneyId: { $eq: subJourneyId } },
          populate: { screens: true },
          status: "published",
          limit: 1,
        });

      const entry = results[0];
      if (!entry) return ctx.notFound();

      const screens = ((entry.screens ?? []) as Array<Record<string, unknown>>)
        .sort((a, b) => (a.sequence as number) - (b.sequence as number))
        .map(({ screenId, screenName, sequence }) => ({
          screenId,
          screenName,
          sequence,
        }));

      return screens;
    },
  }),
);
