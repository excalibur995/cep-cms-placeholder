/**
 * notification-template controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::notification-template.notification-template',
  ({ strapi }) => ({
    async findByTemplateId(ctx) {
      const { templateId } = ctx.params as { templateId: string };
      const results = await strapi
        .documents('api::notification-template.notification-template')
        .findMany({
          filters: { templateId: { $eq: templateId } },
          sort: [{ version: 'desc' }],
          limit: 1,
          status: 'published',
        });
      const entity = results[0];
      if (!entity) return ctx.notFound();
      return entity;
    },
  }),
);
