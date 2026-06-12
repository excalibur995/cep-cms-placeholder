type ZoneEntry = Record<string, unknown>;

interface MessagesEntry {
  required?: string;
  email?: string;
  minLength?: string;
  maxLength?: string;
  pattern?: string;
  type?: string;
}

interface OneOfEntry {
  const: string;
  title: string;
}

export interface SchemaProperty {
  type?: string;
  minLength?: number;
  maxLength?: number;
  messages?: MessagesEntry;
  oneOf?: OneOfEntry[];
  items?: { oneOf: OneOfEntry[] };
  uniqueItems?: boolean;
  // nested object support
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

export interface AggregatedSchema {
  url?: string;
  type: "object";
  properties: Record<string, SchemaProperty>;
  required: string[];
}

const formKeysCategory = ["input"];

function extractSchemaEntry(entry: ZoneEntry): { path: string[]; prop: SchemaProperty; required: boolean } | null {
  const componentId = entry.componentId as string | undefined;
  if (!componentId) return null;

  const category = (entry.__component as string | undefined)?.split(".")[0];
  if (!formKeysCategory.includes(category)) return null;

  const isRequired = Boolean(entry.required);
  const prop: SchemaProperty = {};
  if (entry.type) prop.type = entry.type as string;
  if (entry.minLength !== null && entry.minLength !== undefined) prop.minLength = entry.minLength as number;
  if (entry.maxLength !== null && entry.maxLength !== undefined) prop.maxLength = entry.maxLength as number;

  const msgs = entry.messages as Record<string, string | null> | undefined | null;
  if (msgs && typeof msgs === "object") {
    const cleaned = Object.fromEntries(
      Object.entries(msgs).filter(([k, v]) => k !== "id" && k !== "__component" && v != null)
    ) as MessagesEntry;
    if (Object.keys(cleaned).length > 0) prop.messages = cleaned;
  }

  const rawOpts = entry.choices as Array<{ value?: unknown; label?: unknown }> | null | undefined;
  if (Array.isArray(rawOpts) && rawOpts.length) {
    const oneOf = rawOpts
      .filter((o) => o && o.value !== undefined && o.value !== null)
      .map((o) => ({ const: String(o.value), title: String(o.label ?? o.value) }));
    if (oneOf.length) {
      const isMulti = (entry.__component as string | undefined) === "input.checkbox";
      if (isMulti) {
        prop.type = "array";
        prop.uniqueItems = true;
        prop.items = { oneOf };
      } else {
        if (!prop.type) prop.type = "string";
        prop.oneOf = oneOf;
      }
    }
  }

  return { path: componentId.split("."), prop, required: isRequired };
}

function setNestedProp(
  properties: Record<string, SchemaProperty>,
  path: string[],
  prop: SchemaProperty
): void {
  if (path.length === 1) {
    properties[path[0]] = prop;
    return;
  }
  const [head, ...rest] = path;
  if (!properties[head]) {
    properties[head] = { type: "object", properties: {}, required: [] };
  }
  const parent = properties[head];
  if (!parent.properties) parent.properties = {};
  setNestedProp(parent.properties, rest, prop);
}

function markRequired(
  properties: Record<string, SchemaProperty>,
  topRequired: string[],
  path: string[]
): void {
  if (path.length === 1) {
    topRequired.push(path[0]);
    return;
  }
  const [head, ...rest] = path;
  const parent = properties[head];
  if (!parent) return;
  if (rest.length === 1) {
    if (!parent.required) parent.required = [];
    if (!parent.required.includes(rest[0])) parent.required.push(rest[0]);
  } else {
    if (!parent.properties) return;
    markRequired(parent.properties, parent.required ?? [], rest);
  }
}

export function aggregateSchema(zones: (ZoneEntry[] | null | undefined)[], url?: string): AggregatedSchema {
  const properties: Record<string, SchemaProperty> = {};
  const required: string[] = [];

  for (const zone of zones) {
    if (!zone?.length) continue;
    for (const entry of zone) {
      const result = extractSchemaEntry(entry);
      if (result) {
        setNestedProp(properties, result.path, result.prop);
        if (result.required) markRequired(properties, required, result.path);
      }
    }
  }

  return { ...(url ? { url } : {}), type: "object", properties, required };
}
