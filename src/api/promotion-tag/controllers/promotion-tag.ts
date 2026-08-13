/**
 * promotion-tag controller
 *
 * GET /promotion-tags is the full tag table (admin/authoring use). The narrower "tags
 * in use on active articles" list that powers the Promotions filter pills lives on
 * promotion-article (findActiveTags), not here.
 *
 * create/update are overridden to call the Document Service directly instead of the
 * stock factory actions. Reason: every route in this repo is `auth:false`, and under
 * `route.config.auth === false` Strapi's authenticate() middleware skips setting
 * `ctx.state.auth` entirely (see @strapi/core/services/auth) — so the stock actions'
 * content-API sanitizer, which validates relation fields against the *request's* auth
 * context, always rejects them ("Invalid key <field>") no matter what Public-role
 * permissions exist. This project has no other content-type with a relation field, so
 * no other controller has hit this; promotion-article.tags is the first. Bypassing the
 * sanitizer here matches the trust model already in place everywhere else — nothing is
 * actually access-controlled today since every route is public.
 */

import { factories } from "@strapi/strapi";

const UID = "api::promotion-tag.promotion-tag";

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body as { data: Record<string, unknown> };
    const entity = await strapi.documents(UID).create({ data: data as never });
    return { data: entity };
  },

  async update(ctx) {
    const { id } = ctx.params as { id: string };
    const { data } = ctx.request.body as { data: Record<string, unknown> };
    const entity = await strapi.documents(UID).update({ documentId: id, data: data as never });
    return { data: entity };
  },
}));
