import {Core} from "@strapi/strapi";
import {webhookMiddleware} from "./lib/webhooks/webhook-middleware";
import {generateTemplateIdMiddleware} from "./lib/notification-template/generate-template-id-middleware";
import {applyFieldLabels} from "./lib/admin/field-labels";
import {applyListLayouts} from "./lib/admin/list-layouts";


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

        strapi.customFields.register({
            name: "parent-language-id",
            type: "string",
        });

        strapi.customFields.register({
            name: "product-group-code",
            type: "string",
        });

        strapi.customFields.register({
            name: "product-category-code",
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

        await applyFieldLabels(strapi);
        await applyListLayouts(strapi);
    },
};
