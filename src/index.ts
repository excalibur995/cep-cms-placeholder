import {Core} from "@strapi/strapi";
import {webhookMiddleware} from "./lib/webhooks/webhook-middleware";
import {generateTemplateIdMiddleware} from "./lib/notification-template/generate-template-id-middleware";


export default {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register({ strapi }: { strapi: Core.Strapi }) {
        strapi.customFields.register({
            name: "template-id",
            type: "string",
        });
    },

    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    async bootstrap({strapi}: { strapi: Core.Strapi }) {
        strapi.documents.use(generateTemplateIdMiddleware);
        strapi.documents.use(webhookMiddleware);
    },
};
