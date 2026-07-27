import {Core} from "@strapi/strapi";
import {FIELD_LABELS} from "./labels";

/**
 * Fields Strapi manages itself. They are never declared in the per content type
 * label modules — their labels are derived instead.
 */
const SYSTEM_FIELDS = new Set([
    "id",
    "documentId",
    "locale",
    "localizations",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "createdBy",
    "updatedBy",
]);

/**
 * Fallback used for system fields only.
 *
 * createdAt -> "Created At", documentId -> "Document ID"
 */
function humanizeSystemField(name: string): string {
    return name
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(" ")
        .map((word) => (word.toLowerCase() === "id" ? "ID" : word.charAt(0).toUpperCase() + word.slice(1)))
        .join(" ");
}

/**
 * Rewrites the Content Manager field labels so the admin shows "Push Title 1"
 * instead of the raw "pushTitle1" attribute name.
 *
 * Labels are declared explicitly in ./labels, one module per content type. The
 * configuration lives in the core store — the same place "Configure the view"
 * writes to — so this runs on every bootstrap to keep every environment in
 * sync, which also means label edits made in the admin UI are overwritten.
 */
export async function applyFieldLabels(strapi: Core.Strapi): Promise<void> {
    for (const [uid, labels] of Object.entries(FIELD_LABELS)) {
        const key = `plugin_content_manager_configuration_content_types::${uid}`;
        const row = await strapi.db.query("strapi::core-store").findOne({where: {key}});

        if (!row) {
            strapi.log.warn(`[field-labels] no content manager configuration found for ${uid}`);
            continue;
        }

        const config = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
        const metadatas = config?.metadatas;

        if (!metadatas) continue;

        let changed = false;

        for (const [field, metadata] of Object.entries<any>(metadatas)) {
            const label = labels[field] ?? (SYSTEM_FIELDS.has(field) ? humanizeSystemField(field) : null);

            if (label === null) {
                strapi.log.warn(`[field-labels] ${uid}.${field} has no label, add it to src/lib/admin/labels`);
                continue;
            }

            for (const view of ["edit", "list"] as const) {
                if (metadata?.[view] && metadata[view].label !== label) {
                    metadata[view].label = label;
                    changed = true;
                }
            }
        }

        if (!changed) continue;

        await strapi.db.query("strapi::core-store").update({
            where: {key},
            data: {value: JSON.stringify(config)},
        });

        strapi.log.info(`[field-labels] updated labels for ${uid}`);
    }
}
