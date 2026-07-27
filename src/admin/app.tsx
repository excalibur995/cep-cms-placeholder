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

    app.customFields.register({
      name: 'parent-language-id',
      type: 'string',
      intlLabel: {
        id: 'notification-template.parentLanguageId.label',
        defaultMessage: 'Parent Language ID',
      },
      intlDescription: {
        id: 'notification-template.parentLanguageId.description',
        defaultMessage: 'Defaults to the locale selected in the content manager.',
      },
      components: {
        Input: async () =>
          import('./components/ParentLanguageIdInput').then((module) => ({
            default: module.default,
          })),
      },
    });

    app.customFields.register({
      name: 'product-group-code',
      type: 'string',
      intlLabel: {
        id: 'product-catalog.productGroupCode.label',
        defaultMessage: 'Product Group Code',
      },
      intlDescription: {
        id: 'product-catalog.productGroupCode.description',
        defaultMessage: 'Pick a product group code from the Product Group collection.',
      },
      components: {
        Input: async () =>
          import('./components/ProductGroupCodeInput').then((module) => ({
            default: module.default,
          })),
      },
    });

    app.customFields.register({
      name: 'product-category-code',
      type: 'string',
      intlLabel: {
        id: 'product-catalog.productCategoryCode.label',
        defaultMessage: 'Product Category Code',
      },
      intlDescription: {
        id: 'product-catalog.productCategoryCode.description',
        defaultMessage: 'Pick a product category code from the Product Category collection.',
      },
      components: {
        Input: async () =>
          import('./components/ProductCategoryCodeInput').then((module) => ({
            default: module.default,
          })),
      },
    });
  },
  bootstrap() {},
};
