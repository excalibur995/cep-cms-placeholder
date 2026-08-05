import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  // Azure Blob upload provider (works with Azurite locally).
  // Enabled only when STORAGE_ACCOUNT is set; otherwise Strapi falls back to
  // the default local provider so dev without Azurite keeps working.
  ...(env('STORAGE_ACCOUNT')
    ? {
        upload: {
          config: {
            provider: 'strapi-provider-upload-azure-storage',
            providerOptions: {
              authType: env('STORAGE_AUTH_TYPE', 'default'),
              account: env('STORAGE_ACCOUNT'),
              accountKey: env('STORAGE_ACCOUNT_KEY'),
              serviceBaseURL: env('STORAGE_URL'),
              containerName: env('STORAGE_CONTAINER_NAME'),
              createContainerIfNotExist: env('STORAGE_CREATE_CONTAINER_IF_NOT_EXIST', 'true'),
              publicAccessType: env('STORAGE_PUBLIC_ACCESS_TYPE', 'blob'),
              defaultPath: env('STORAGE_DEFAULT_PATH', 'assets'),
              cdnBaseURL: env('STORAGE_CDN_URL', ''),
            },
          },
        },
      }
    : {}),
});

export default config;
