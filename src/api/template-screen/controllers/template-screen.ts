import { factories } from "@strapi/strapi";

const EXCLUDED_FIELDS = new Set(["__component", "id", "span", "componentId", "hide"]);

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

// Strapi 5 does not populate manyToOne relations inside dynamic zone `on` blocks.
// Work around by traversing the link table directly then fetching the published OG.
async function resolveOptionsGroupValues(
  strapi: any,
  entries: ZoneEntry[]
): Promise<Map<number, OptionItem[]>> {
  const map = new Map<number, OptionItem[]>();
  const knex = strapi.db.connection;

  for (const entry of entries) {
    if (entry.__component !== "input.dropdown" || !entry.id) continue;

    const link = await knex("components_input_dropdowns_options_group_lnk as lnk")
      .join("options_groups as og", "og.id", "lnk.options_group_id")
      .where("lnk.dropdown_id", entry.id)
      .whereNotNull("og.published_at")
      .select("og.document_id")
      .first();

    if (!link) continue;

    const og = await strapi
      .documents("api::options-group.options-group")
      .findOne({ documentId: link.document_id, populate: { items: true }, status: "published" });

    if (og?.items?.length) {
      map.set(
        entry.id as number,
        og.items.map(({ displayValue, value }: OptionItem) => ({ displayValue, value }))
      );
    }
  }

  return map;
}

function shapeComponent(entry: ZoneEntry, ogValues: Map<number, OptionItem[]>): Record<string, unknown> {
  const shaped: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(entry)) {
    if (EXCLUDED_FIELDS.has(k) || v === null || v === undefined) continue;
    shaped[k] = v;
  }

  if ("defaultValue" in entry) shaped.defaultValue = entry.defaultValue ?? null;

  if (entry.__component === "input.dropdown" && entry.id) {
    const items = ogValues.get(entry.id as number);
    if (items) shaped.values = items;
  }

  return shaped;
}

function shapeComponents(entries: ZoneEntry[], ogValues: Map<number, OptionItem[]>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const entry of entries) {
    if (entry.hide === true) continue;
    const key = entry.componentId as string | undefined;
    if (!key) continue;
    result[key] = shapeComponent(entry, ogValues);
  }
  return result;
}

function shapeEntity(entity: Record<string, unknown>, ogValues: Map<number, OptionItem[]>) {
  const components = (entity.components as ZoneEntry[]) ?? [];
  return {
    screenId: entity.screenId,
    template: entity.template,
    components: shapeComponents(components, ogValues),
  };
}

export default factories.createCoreController("api::template-screen.template-screen", ({ strapi }) => ({
  async find(ctx) {
    const results = await strapi.documents("api::template-screen.template-screen").findMany({
      populate: POPULATE,
      status: "published",
    });
    const allEntries = results.flatMap((e) => ((e as any).components as ZoneEntry[]) ?? []);
    const ogValues = await resolveOptionsGroupValues(strapi, allEntries);
    return results.map((e) => shapeEntity(e as unknown as Record<string, unknown>, ogValues));
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
    const entries = ((entity as any).components as ZoneEntry[]) ?? [];
    const ogValues = await resolveOptionsGroupValues(strapi, entries);
    return shapeEntity(entity as unknown as Record<string, unknown>, ogValues);
  },
}));
