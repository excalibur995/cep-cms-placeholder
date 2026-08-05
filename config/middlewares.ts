import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // Allow admin to preview assets served from Azurite / Azure Blob.
          'img-src': ["'self'", 'data:', 'blob:', '127.0.0.1:10000', 'localhost:10000', '*.blob.core.windows.net'],
          'media-src': ["'self'", 'data:', 'blob:', '127.0.0.1:10000', 'localhost:10000', '*.blob.core.windows.net'],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
