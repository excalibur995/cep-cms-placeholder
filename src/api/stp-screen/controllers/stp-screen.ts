/**
 * stp-screen controller
 */

import { factories } from "@strapi/strapi";
import { aggregateSchema, SchemaProperty } from "./schema-aggregator";
import { transformZone } from "./transform";

const INPUT_POPULATE = {
  populate: {
    messages: true,
    dynamic: { populate: { source: true } },
    dependent: true,
    rule: { populate: { condition: true } },
  },
};

const CHOICE_INPUT_POPULATE = {
  populate: {
    messages: true,
    dynamic: { populate: { source: true } },
    dependent: true,
    rule: { populate: { condition: true } },
    choices: true,
  },
};

const DYNAMIC_POPULATE = {
  populate: {
    dynamic: { populate: { source: true } },
  },
};

const LIST_POPULATE = {
  populate: {
    dynamic: { populate: { source: true } },
    items: true,
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
    "container.list": LIST_POPULATE,
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

const OVERLAY_ZONE_POPULATE = {
  header: ZONE_ON,
  body: ZONE_ON,
  footer: ZONE_ON,
};

const POPULATE = {
  header: ZONE_ON,
  body: ZONE_ON,
  footer: ZONE_ON,
  overlay: { populate: OVERLAY_ZONE_POPULATE },
};

type ZoneEntry = Record<string, unknown>;

function buildData(properties: Record<string, SchemaProperty>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(properties).map(([k, prop]) => {
      if (prop.type === "array") return [k, []];
      if (prop.type === "object" && prop.properties) return [k, buildData(prop.properties)];
      return [k, ""];
    }),
  );
}

interface OverlayEntity {
  overlayId: string;
  type?: string;
  header?: ZoneEntry[];
  body?: ZoneEntry[];
  footer?: ZoneEntry[];
}

function shapeOverlay(overlay: OverlayEntity) {
  const header = overlay.header ?? [];
  const body = overlay.body ?? [];
  const footer = overlay.footer ?? [];
  return {
    type: overlay.type ?? "modal",
    header: { type: "VerticalLayout", elements: transformZone(header) },
    body: { type: "VerticalLayout", elements: transformZone(body) },
    footer: { type: "VerticalLayout", elements: transformZone(footer) },
  };
}

function shapeEntity(entity: Record<string, unknown>) {
  const header = (entity.header as ZoneEntry[]) ?? [];
  const body = (entity.body as ZoneEntry[]) ?? [];
  const footer = (entity.footer as ZoneEntry[]) ?? [];
  const rawOverlay = (entity.overlay as OverlayEntity[]) ?? [];

  const overlayZones = rawOverlay.flatMap((o) => [o.header ?? [], o.body ?? [], o.footer ?? []]);
  const schema = aggregateSchema([header, body, footer, ...overlayZones], entity.url as string | undefined);

  const overlay = Object.fromEntries(rawOverlay.map((o) => [o.overlayId, shapeOverlay(o)]));

  return {
    screenId: entity.screenId,
    version: entity.version,
    schema,
    uiSchema: {
      header: { type: "VerticalLayout", elements: transformZone(header) },
      body: { type: "VerticalLayout", elements: transformZone(body) },
      footer: { type: "VerticalLayout", elements: transformZone(footer) },
      ...(rawOverlay.length ? { overlay } : {}),
    },
    data: buildData(schema.properties),
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
    return shapeEntity(entity as unknown as Record<string, unknown>);
  },
}));
