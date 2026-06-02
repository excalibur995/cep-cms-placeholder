type ZoneEntry = Record<string, unknown>;

interface MessagesEntry {
  required?: string;
  email?: string;
  minLength?: string;
  maxLength?: string;
  pattern?: string;
  type?: string;
}

interface SchemaEntry {
  required?: boolean;
  type?: string;
  minLength?: number;
  maxLength?: number;
  messages?: MessagesEntry;
}

function stripNulls<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '')
  ) as Partial<T>;
}

function extractSchemaEntry(entry: ZoneEntry): [string, SchemaEntry] | null {
  const componentId = entry.componentId as string | undefined;
  if (!componentId) return null;

  const raw: SchemaEntry = {};
  if (entry.required !== undefined && entry.required !== null) raw.required = entry.required as boolean;
  if (entry.type) raw.type = entry.type as string;
  if (entry.minLength !== null && entry.minLength !== undefined) raw.minLength = entry.minLength as number;
  if (entry.maxLength !== null && entry.maxLength !== undefined) raw.maxLength = entry.maxLength as number;

  const msgs = entry.messages as Record<string, string> | undefined | null;
  if (msgs && typeof msgs === 'object') {
    const cleaned = stripNulls(msgs) as MessagesEntry;
    delete (cleaned as Record<string, unknown>).id;
    delete (cleaned as Record<string, unknown>).__component;
    if (Object.keys(cleaned).length > 0) raw.messages = cleaned;
  }

  // Only include components that have at least one schema attribute
  const hasSchema = raw.required !== undefined || raw.type || raw.minLength !== undefined || raw.maxLength !== undefined || raw.messages;
  if (!hasSchema) return null;

  return [componentId, raw];
}

export function aggregateSchema(
  zones: (ZoneEntry[] | null | undefined)[]
): Record<string, SchemaEntry> {
  const schema: Record<string, SchemaEntry> = {};
  for (const zone of zones) {
    if (!zone?.length) continue;
    for (const entry of zone) {
      const result = extractSchemaEntry(entry);
      if (result) {
        const [id, def] = result;
        schema[id] = def;
      }
    }
  }
  return schema;
}
