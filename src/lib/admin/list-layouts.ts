import {Core} from "@strapi/strapi";

/**
 * Content Manager list-view columns, one entry per content type.
 *
 * Mirrors applyFieldLabels: the configuration lives in the core store — the
 * same place "Configure the view" writes to — so this runs on every bootstrap
 * to keep every environment in sync, which also means list-column changes made
 * in the admin UI are overwritten.
 *
 * Each value is the ordered list of attribute names shown as columns. Only
 * attributes that exist in the content type's Content Manager metadata are
 * applied; unknown names are dropped with a warning.
 */
const LIST_LAYOUTS: Record<string, string[]> = {
    "api::product-group.product-group": ["id", "screenId", "moduleId", "updatedAt"],
    "api::product-category.product-category": ["id", "productGroupCode", "updatedAt"],
    "api::product.product": ["id", "productGroupCode", "productCategoryCode", "updatedAt"],
    "api::promotion-article.promotion-article": ["id", "promotionArticleId", "title", "recommended", "updatedAt"],
    "api::promotion-tag.promotion-tag": ["id", "tagCode", "tagName", "updatedAt"],
};

export async function applyListLayouts(strapi: Core.Strapi): Promise<void> {
    for (const [uid, columns] of Object.entries(LIST_LAYOUTS)) {
        const key = `plugin_content_manager_configuration_content_types::${uid}`;
        const row = await strapi.db.query("strapi::core-store").findOne({where: {key}});

        if (!row) {
            strapi.log.warn(`[list-layouts] no content manager configuration found for ${uid}`);
            continue;
        }

        const config = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
        const metadatas = config?.metadatas;

        if (!config?.layouts || !metadatas) continue;

        const nextColumns = columns.filter((field) => {
            if (metadatas[field]) return true;
            strapi.log.warn(`[list-layouts] ${uid}.${field} is not a known field, skipping`);
            return false;
        });

        const current = Array.isArray(config.layouts.list) ? config.layouts.list : [];
        const unchanged =
            current.length === nextColumns.length && current.every((col, i) => col === nextColumns[i]);

        if (unchanged) continue;

        config.layouts.list = nextColumns;

        await strapi.db.query("strapi::core-store").update({
            where: {key},
            data: {value: JSON.stringify(config)},
        });

        strapi.log.info(`[list-layouts] updated list columns for ${uid}`);
    }
}
