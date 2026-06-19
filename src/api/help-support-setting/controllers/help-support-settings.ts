import { factories } from "@strapi/strapi";

const UID = "api::help-support-setting.help-support-setting";

export default factories.createCoreController(UID as never, ({ strapi }) => ({
  async find(ctx) {
    const { locale } = ctx.query as { locale?: string };
    const entity = await (strapi.documents(UID as never) as any).findFirst({
      populate: { contacts: true, guide: true, about: true },
      status: "published",
      ...(locale ? { locale } : {}),
    });
    if (!entity) return ctx.notFound();
    return {
      contacts: entity.contacts ?? {},
      guide: entity.guide ?? {},
      about: entity.about ?? {},
    };
  },
}));
