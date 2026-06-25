import { factories } from "@strapi/strapi";

const EXCLUDED_FIELDS = new Set(["__component", "id", "span", "componentId"]);

const INPUT_POPULATE = {
  populate: {
    messages: true,
    rule: { populate: { condition: true } },
    dataSource: { populate: { responseMap: true } },
  },
};

const DROPDOWN_POPULATE = {
  populate: {
    messages: true,
    rule: { populate: { condition: true } },
    dataSource: { populate: { responseMap: true } },
    choices: true,
    optionsGroup: { populate: { items: true } },
  },
};

const DYNAMIC_POPULATE = {
  populate: { dynamic: { populate: { source: true } } },
};

const LIST_POPULATE = {
  populate: { dynamic: { populate: { source: true } }, items: true },
};

const ZONE_ON = {
  on: {
    // input
    "input.dropdown": DROPDOWN_POPULATE,
    "input.checkbox": INPUT_POPULATE,
    "input.number-input-stepper": INPUT_POPULATE,
    "input.pin-input": INPUT_POPULATE,
    "input.radio-button": INPUT_POPULATE,
    "input.search-input": INPUT_POPULATE,
    "input.slider": INPUT_POPULATE,
    "input.text-input": INPUT_POPULATE,
    "input.toggle": INPUT_POPULATE,
    "input.uploader": INPUT_POPULATE,
    // dynamic-capable
    "action.bottom-quick-action": DYNAMIC_POPULATE,
    "action.quick-action-section": LIST_POPULATE,
    "container.list": LIST_POPULATE,
    "core.grid": DYNAMIC_POPULATE,
    "core.typo": DYNAMIC_POPULATE,
    "navigation.bottom-navigation": DYNAMIC_POPULATE,
    // flat
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

const POPULATE = { components: ZONE_ON };

type ZoneEntry = Record<string, unknown>;
type OptionItem = { displayValue: string; value: string };
type OptionsGroup = { slug: string; items?: OptionItem[] };

function shapeComponent(entry: ZoneEntry): Record<string, unknown> {
  const shaped: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(entry)) {
    if (EXCLUDED_FIELDS.has(k) || v === null || v === undefined) continue;
    shaped[k] = v;
  }

  const optionsGroup = entry.optionsGroup as OptionsGroup | null | undefined;
  if (optionsGroup?.slug) {
    shaped.values = (optionsGroup.items ?? []).map(({ displayValue, value }) => ({ displayValue, value }));
  }
  delete shaped.optionsGroup;

  return shaped;
}

function shapeComponents(entries: ZoneEntry[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const entry of entries) {
    const key = entry.componentId as string | undefined;
    if (!key) continue;
    result[key] = shapeComponent(entry);
  }
  return result;
}

function shapeEntity(entity: Record<string, unknown>) {
  const components = (entity.components as ZoneEntry[]) ?? [];
  return {
    screenId: entity.screenId,
    template: entity.template,
    components: shapeComponents(components),
  };
}

export default factories.createCoreController("api::template-screen.template-screen", ({ strapi }) => ({
  async find(ctx) {
    const results = await strapi.documents("api::template-screen.template-screen").findMany({
      populate: POPULATE,
      status: "published",
    });
    return results.map((e) => shapeEntity(e as unknown as Record<string, unknown>));
  },

  async findByScreenId(ctx) {
    const { screenId } = ctx.params as { screenId: string };
    const results = await strapi.documents("api::template-screen.template-screen").findMany({
      filters: { screenId: { $eq: screenId } },
      populate: POPULATE,
      status: "published",
      limit: 1,
    });
    const entity = results[0];
    if (!entity) return ctx.notFound();
    return shapeEntity(entity as unknown as Record<string, unknown>);
  },
}));
