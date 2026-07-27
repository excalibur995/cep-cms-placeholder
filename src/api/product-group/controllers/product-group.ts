/**
 * product-group controller
 *
 * Collection keyed by (screenId, moduleId). Each entry's `groups` json holds
 * the product-group array shown for that screen/module.
 *
 * GET /product-groups
 *   - screenId + moduleId both present -> "find by id": the single matching
 *     entry (404 if none).
 *   - otherwise -> the list of entries (optionally filtered by either key).
 * The groups array is always sorted by displayOrder.
 */

import { factories } from "@strapi/strapi";

const UID = "api::product-group.product-group";

type ProductGroupEntry = {
  screenId?: string;
  moduleId?: string;
  groups?: Record<string, any>[];
};

const byDisplayOrder = (a: Record<string, any>, b: Record<string, any>) =>
  (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0);

const toWrapper = (entry: ProductGroupEntry) => ({
  screenId: entry.screenId,
  moduleId: entry.moduleId,
  groups: [...(entry.groups ?? [])].sort(byDisplayOrder),
});

export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(ctx) {
    const { screenId, moduleId } = (ctx.query ?? {}) as {
      screenId?: string;
      moduleId?: string;
    };

    const filters: Record<string, unknown> = {};
    if (screenId) filters.screenId = { $eq: screenId };
    if (moduleId) filters.moduleId = { $eq: moduleId };

    const results = (await strapi
      .documents(UID)
      .findMany({ filters, status: "published" })) as unknown as ProductGroupEntry[];

    // Find by id: a full (screenId, moduleId) key resolves to one entry.
    if (screenId && moduleId) {
      const entry = results[0];
      if (!entry) {
        return ctx.notFound();
      }
      return toWrapper(entry);
    }

    return results.map(toWrapper);
  },

  /**
   * GET /product-groups/codes
   * Distinct { productGroupCode, productGroupName } across every entry's groups.
   * Powers the searchable dropdown used by product-category.
   */
  async findCodes() {
    const results = (await strapi
      .documents(UID)
      .findMany({ status: "published" })) as unknown as ProductGroupEntry[];

    const seen = new Map<string, { productGroupCode: string; productGroupName?: string }>();
    for (const entry of results) {
      for (const group of entry.groups ?? []) {
        const code = group?.productGroupCode;
        if (code && !seen.has(code)) {
          seen.set(code, { productGroupCode: code, productGroupName: group?.productGroupName });
        }
      }
    }

    return [...seen.values()];
  },
}));
