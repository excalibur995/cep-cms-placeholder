import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    app.customFields.register({
      name: 'template-id',
      type: 'string',
      intlLabel: {
        id: 'notification-template.templateId.label',
        defaultMessage: 'Template ID',
      },
      intlDescription: {
        id: 'notification-template.templateId.description',
        defaultMessage: 'Auto-generated identifier (UUID v4).',
      },
      components: {
        Input: async () =>
          import('./components/TemplateIdInput').then((module) => ({
            default: module.default,
          })),
      },
    });
  },
  bootstrap() {},
};
