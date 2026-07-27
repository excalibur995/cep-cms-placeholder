/**
 * i18n-content controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::i18n-content.i18n-content', ({ strapi }) => ({
  async find(ctx) {
    // Shorthand: ?moduleId=accountDashboard -> filters[moduleId][$eq]=accountDashboard
    if (ctx.query.moduleId) {
      ctx.query.filters = {
        ...((ctx.query.filters as Record<string, unknown>) ?? {}),
        moduleId: ctx.query.moduleId,
      };
      delete ctx.query.moduleId;
    }

    // If a specific locale is explicitly requested, keep the default behavior.
    if (ctx.query.locale && ctx.query.locale !== 'all') {
      return super.find(ctx);
    }

    // Otherwise return the content grouped by every configured locale (en, id, ...).
    const locales: Array<{ code: string }> = await strapi
      .plugin('i18n')
      .service('locales')
      .find();
    const localeCodes = locales.map((l) => l.code);

    const data: Record<string, unknown> = {};
    for (const code of localeCodes) {
      ctx.query.locale = code;
      const res = await super.find(ctx);
      const entries = Array.isArray(res?.data) ? res.data : [];
      data[code] = entries[0] ?? null;
    }

    return { data, meta: { locales: localeCodes } };
  },
}));
