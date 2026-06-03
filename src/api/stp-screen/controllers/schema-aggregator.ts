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

interface SchemaProperty {
  type?: string;
  minLength?: number;
  maxLength?: number;
  messages?: MessagesEntry;
  oneOf?: OneOfEntry[];
  items?: { oneOf: OneOfEntry[] };
  uniqueItems?: boolean;
}

export interface AggregatedSchema {
  type: "object";
  properties: Record<string, SchemaProperty>;
  required: string[];
}

const formKeysCategory = ["input"];

function extractSchemaEntry(entry: ZoneEntry): { id: string; prop: SchemaProperty; required: boolean } | null {
  const componentId = entry.componentId as string | undefined;
  if (!componentId) return null;

  // Only input.* components participate in schema/data binding
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

  return { id: componentId, prop, required: isRequired };
}

export function aggregateSchema(zones: (ZoneEntry[] | null | undefined)[]): AggregatedSchema {
  const properties: Record<string, SchemaProperty> = {};
  const required: string[] = [];

  for (const zone of zones) {
    if (!zone?.length) continue;
    for (const entry of zone) {
      const result = extractSchemaEntry(entry);
      if (result) {
        properties[result.id] = result.prop;
        if (result.required) required.push(result.id);
      }
    }
  }

  return { type: "object", properties, required };
}
