import notificationTemplate from "./notification-template";
import productGroup from "./product-group";
import productCategory from "./product-category";
import product from "./product";

/**
 * Content Manager field labels, one module per content type.
 *
 * Every attribute declared in a content type's schema.json should have an entry
 * here — applyFieldLabels warns on anything missing. Strapi's own fields
 * (id, documentId, createdAt, ...) are derived automatically and must not be
 * listed.
 */
export const FIELD_LABELS: Record<string, Record<string, string>> = {
    "api::notification-template.notification-template": notificationTemplate,
    "api::product-group.product-group": productGroup,
    "api::product-category.product-category": productCategory,
    "api::product.product": product,
};
