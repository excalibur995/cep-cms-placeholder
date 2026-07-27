/**
 * product-category controller
 *
 * Collection keyed by productGroupCode. Each entry's `categories` json holds the
 * category array for that group.
 *
 * GET /product-categories
 *   - productGroupCode present -> the matching entry's categories array,
 *     flattened (404 if no entry for that group).
 *   - otherwise -> the list of entries, each wrapped with its productGroupCode.
 * The categories array is always sorted by displayOrder.
 */

import { factories } from "@strapi/strapi";

const UID = "api::product-category.product-category";

type ProductCategoryEntry = {
  productGroupCode?: string;
  categories?: Record<string, any>[];
};

const byDisplayOrder = (a: Record<string, any>, b: Record<string, any>) =>
  (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0);

const toWrapper = (entry: ProductCategoryEntry) => ({
  productGroupCode: entry.productGroupCode,
  categories: [...(entry.categories ?? [])].sort(byDisplayOrder),
});

export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(ctx) {
    const { productGroupCode } = (ctx.query ?? {}) as { productGroupCode?: string };

    const filters = productGroupCode
      ? { productGroupCode: { $eq: productGroupCode } }
      : {};

    const results = (await strapi
      .documents(UID)
      .findMany({ filters, status: "published" })) as unknown as ProductCategoryEntry[];

    // Find by id: productGroupCode resolves to one entry's categories.
    if (productGroupCode) {
      const entry = results[0];
      if (!entry) {
        return ctx.notFound();
      }
      return toWrapper(entry).categories;
    }

    return results.map(toWrapper);
  },

  /**
   * GET /product-categories/codes
   * Distinct { productCategoryCode, productCategoryName, productGroupCode } across
   * every entry's categories. Powers the searchable dropdown used by product.
   */
  async findCodes() {
    const results = (await strapi
      .documents(UID)
      .findMany({ status: "published" })) as unknown as ProductCategoryEntry[];

    const seen = new Map<
      string,
      { productCategoryCode: string; productCategoryName?: string; productGroupCode?: string }
    >();
    for (const entry of results) {
      for (const category of entry.categories ?? []) {
        const code = category?.productCategoryCode;
        if (code && !seen.has(code)) {
          seen.set(code, {
            productCategoryCode: code,
            productCategoryName: category?.productCategoryName,
            productGroupCode: category?.productGroupCode,
          });
        }
      }
    }

    return [...seen.values()];
  },
}));
