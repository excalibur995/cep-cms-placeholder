/**
 * non-stp-screen controller
 */

import { factories } from "@strapi/strapi";

const DYNAMIC_POPULATE = {
  populate: { dynamic: { populate: { source: true } } },
};

const ZONE_ON = {
  on: {
    "action.bottom-quick-action": DYNAMIC_POPULATE,
    "action.quick-action-section": {
      populate: { items: true, dynamic: { populate: { source: true } } },
    },
    "container.list": DYNAMIC_POPULATE,
    "core.grid": DYNAMIC_POPULATE,
    "core.typo": DYNAMIC_POPULATE,
    "navigation.bottom-navigation": DYNAMIC_POPULATE,
    "action.button": true,
    "action.chip": true,
    "asset.icon": true,
    "asset.image": true,
    "container.accordion": true,
    "container.banner": true,
    "container.bento": true,
    "container.card": true,
    "container.divider": true,
    "core.avatar": true,
    "input.checkbox": true,
    "input.dropdown": true,
    "input.number-input-stepper": true,
    "input.pin-input": true,
    "input.radio-button": true,
    "input.search-input": true,
    "input.slider": true,
    "input.text-input": true,
    "input.toggle": true,
    "input.uploader": true,
    "navigation.bottom-tab-item": true,
    "navigation.navigation-header": true,
    "navigation.section-header": true,
    "navigation.tab": true,
    "navigation.toolbar": true,
    "navigation.top-navigation": true,
    "overlay.coackmark-and-hint": true,
    "overlay.edit-menu": true,
    "status-and-feedback.alert-banner": true,
    "status-and-feedback.badge": true,
    "status-and-feedback.progress-indicator": true,
    "status-and-feedback.toast": true,
  },
};

const POPULATE = { components: ZONE_ON };

const EXCLUDED_FIELDS = new Set(["__component", "id", "span"]);

function kebabToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

type ZoneEntry = Record<string, unknown>;

function groupByCategory(
  entries: ZoneEntry[],
): Record<string, Record<string, unknown[]>> {
  const result: Record<string, Record<string, unknown[]>> = {};

  for (const entry of entries) {
    const [cat, type] = (entry.__component as string).split(".");
    const category = kebabToCamel(cat);
    const componentType = kebabToCamel(type);

    if (!result[category]) result[category] = {};
    if (!result[category][componentType]) result[category][componentType] = [];

    const item: Record<string, unknown> = {};
    if (entry.componentId) item.id = entry.componentId;
    for (const [k, v] of Object.entries(entry)) {
      if (
        !EXCLUDED_FIELDS.has(k) &&
        k !== "componentId" &&
        v !== null &&
        v !== undefined
      ) {
        item[k] = v;
      }
    }

    result[category][componentType].push(item);
  }

  return result;
}

function shapeEntity(entity: Record<string, unknown>) {
  const components = (entity.components as ZoneEntry[]) ?? [];
  return {
    screenId: entity.screenId,
    version: entity.version,
    ...groupByCategory(components),
  };
}

export default factories.createCoreController(
  "api::non-stp-screen.non-stp-screen",
  ({ strapi }) => ({
    async find(ctx) {
      const { sort, filters, locale, pagination } = (ctx.query ?? {}) as Record<
        string,
        unknown
      >;
      const results = await strapi
        .documents("api::non-stp-screen.non-stp-screen")
        .findMany({
          populate: POPULATE,
          status: "published",
          ...(sort ? { sort: sort as never } : {}),
          ...(filters ? { filters: filters as never } : {}),
          ...(locale ? { locale: locale as string } : {}),
        });
      const page = (pagination as Record<string, unknown>) ?? {};
      return {
        data: results.map((e) =>
          shapeEntity(e as unknown as Record<string, unknown>),
        ),
        meta: {
          pagination: {
            page: page.page ?? 1,
            pageSize: page.pageSize ?? results.length,
            total: results.length,
          },
        },
      };
    },

    async findByScreenId(ctx) {
      const { screenId } = ctx.params as { screenId: string };
      const results = await strapi
        .documents("api::non-stp-screen.non-stp-screen")
        .findMany({
          filters: { screenId: { $eq: screenId } },
          populate: POPULATE,
          sort: [{ version: "desc" }],
          limit: 1,
          status: "published",
        });
      const entity = results[0];
      if (!entity) return ctx.notFound();
      return {
        data: shapeEntity(entity as unknown as Record<string, unknown>),
      };
    },
  }),
);
