/**
 * stp-screen controller
 */

import { factories } from "@strapi/strapi";
import { aggregateSchema } from "./schema-aggregator";
import { transformZone } from "./transform";

const EXCLUDED_FIELDS = new Set(["__component", "id", "span"]);

function kebabToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function groupByCategory(entries: ZoneEntry[]): Record<string, Record<string, unknown[]>> {
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
      if (!EXCLUDED_FIELDS.has(k) && k !== "componentId" && v !== null && v !== undefined) {
        item[k] = v;
      }
    }
    result[category][componentType].push(item);
  }
  return result;
}

const INPUT_POPULATE = {
  populate: {
    messages: true,
    dynamic: { populate: { source: true } },
    dependsOn: true,
    rule: { populate: { condition: true } },
  },
};

const CHOICE_INPUT_POPULATE = {
  populate: {
    messages: true,
    dynamic: { populate: { source: true } },
    dependsOn: true,
    rule: { populate: { condition: true } },
    choices: true,
  },
};

const DYNAMIC_POPULATE = {
  populate: {
    dynamic: { populate: { source: true } },
  },
};

// Strapi v5: 'on' must list every component type you want returned.
// Types not listed here are excluded from the response.
const ZONE_ON = {
  on: {
    // input — need messages + dynamic.source; choice inputs also need choices
    "input.checkbox": CHOICE_INPUT_POPULATE,
    "input.dropdown": CHOICE_INPUT_POPULATE,
    "input.radio-button": CHOICE_INPUT_POPULATE,
    "input.number-input-stepper": INPUT_POPULATE,
    "input.pin-input": INPUT_POPULATE,
    "input.search-input": INPUT_POPULATE,
    "input.slider": INPUT_POPULATE,
    "input.text-input": INPUT_POPULATE,
    "input.toggle": INPUT_POPULATE,
    "input.uploader": INPUT_POPULATE,
    // dynamic-capable non-input — need dynamic.source
    "action.bottom-quick-action": DYNAMIC_POPULATE,
    "action.quick-action-section": {
      populate: {
        items: true,
        dynamic: { populate: { source: true } },
      },
    },
    "container.list": DYNAMIC_POPULATE,
    "core.grid": DYNAMIC_POPULATE,
    "core.typo": DYNAMIC_POPULATE,
    "navigation.bottom-navigation": DYNAMIC_POPULATE,
    // remaining — no nested components, must still be listed
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

const POPULATE = {
  header: ZONE_ON,
  body: ZONE_ON,
  footer: ZONE_ON,
};

type ZoneEntry = Record<string, unknown>;

function shapeEntity(entity: Record<string, unknown>) {
  const header = (entity.header as ZoneEntry[]) ?? [];
  const body = (entity.body as ZoneEntry[]) ?? [];
  const footer = (entity.footer as ZoneEntry[]) ?? [];
  const isSTPScreen = entity.isSTPScreen !== false;

  if (!isSTPScreen) {
    const allComponents = [...header, ...body, ...footer];
    return {
      screenId: entity.screenId,
      version: entity.version,
      ...groupByCategory(allComponents),
    };
  }

  const schema = aggregateSchema([header, body, footer]);

  return {
    screenId: entity.screenId,
    version: entity.version,
    isSTPScreen: true,
    schema,
    uiSchema: {
      header: { type: "VerticalLayout", elements: transformZone(header) },
      body: { type: "VerticalLayout", elements: transformZone(body) },
      footer: { type: "VerticalLayout", elements: transformZone(footer) },
    },
    data: Object.fromEntries(
      Object.keys(schema.properties).map((k) => [k, schema.properties[k].type === "array" ? [] : ""])
    ),
  };
}

export default factories.createCoreController("api::stp-screen.stp-screen", ({ strapi }) => ({
  async find(ctx) {
    const { sort, filters, locale, pagination } = (ctx.query ?? {}) as Record<string, unknown>;
    const results = await strapi.documents("api::stp-screen.stp-screen").findMany({
      populate: POPULATE,
      status: "published",
      ...(sort ? { sort: sort as never } : {}),
      ...(filters ? { filters: filters as never } : {}),
      ...(locale ? { locale: locale as string } : {}),
    });
    const page = (pagination as Record<string, unknown>) ?? {};
    return {
      data: results.map((e) => shapeEntity(e as unknown as Record<string, unknown>)),
      meta: { pagination: { page: page.page ?? 1, pageSize: page.pageSize ?? results.length, total: results.length } },
    };
  },

  async findByScreenId(ctx) {
    const { screenId } = ctx.params as { screenId: string };

    const results = await strapi.documents("api::stp-screen.stp-screen").findMany({
      filters: { screenId: { $eq: screenId } },
      populate: POPULATE,
      sort: [{ version: "desc" }],
      limit: 1,
      status: "published",
    });
    const entity = results[0];
    if (!entity) return ctx.notFound();
    return { data: shapeEntity(entity as unknown as Record<string, unknown>) };
  },
}));
