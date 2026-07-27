/**
 * product controller
 *
 * Collection keyed by (productGroupCode, productCategoryCode). Each entry's
 * `data` json holds the aggregated payload verbatim — the `{ products: [...] }`
 * object from the mock.
 *
 * GET /aggregated-products?productGroupCode=&productCategoryCode=
 *   - both codes present -> "find by id": that entry's `data` object as-is.
 *   - otherwise -> the products merged across entries, as { products: [...] }.
 * GET /products/:productId
 *   - the single aggregated product item (searched inside every entry's data).
 */

import { factories } from "@strapi/strapi";

const UID = "api::product.product";

type AggregatedItem = { product?: { productId?: string; displayOrder?: number } };

type ProductEntry = {
  productGroupCode?: string;
  productCategoryCode?: string;
  data?: { products?: AggregatedItem[] } & Record<string, unknown>;
};

const byProductDisplayOrder = (a: AggregatedItem, b: AggregatedItem) =>
  (a?.product?.displayOrder ?? 0) - (b?.product?.displayOrder ?? 0);

export default factories.createCoreController(UID, ({ strapi }) => ({
  async findAggregated(ctx) {
    const { productGroupCode, productCategoryCode } = (ctx.query ?? {}) as {
      productGroupCode?: string;
      productCategoryCode?: string;
    };

    const filters: Record<string, unknown> = {};
    if (productGroupCode) filters.productGroupCode = { $eq: productGroupCode };
    if (productCategoryCode) filters.productCategoryCode = { $eq: productCategoryCode };

    const results = (await strapi
      .documents(UID)
      .findMany({ filters, status: "published" })) as unknown as ProductEntry[];

    // Find by id: a full (group, category) key resolves to one entry's payload.
    if (productGroupCode && productCategoryCode) {
      const entry = results[0];
      if (!entry) {
        return ctx.notFound();
      }
      return entry.data ?? { products: [] };
    }

    const products = results
      .flatMap((entry) => entry.data?.products ?? [])
      .sort(byProductDisplayOrder);

    return { products };
  },

  /** GET /products/:productId -> the aggregated item whose product.productId matches. */
  async findByProductId(ctx) {
    const { productId } = ctx.params as { productId: string };

    const results = (await strapi
      .documents(UID)
      .findMany({ status: "published" })) as unknown as ProductEntry[];

    for (const entry of results) {
      const found = (entry.data?.products ?? []).find(
        (item) => item?.product?.productId === productId,
      );
      if (found) {
        return found;
      }
    }

    return ctx.notFound();
  },
}));
