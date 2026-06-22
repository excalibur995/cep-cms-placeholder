import { toSchemaPath, toScopePath } from "./utils";

type ZoneEntry = Record<string, unknown>;

const LIFTED_FIELDS = new Set([
  "componentId",
  "required",
  "type",
  "minLength",
  "maxLength",
  "messages",
  "dynamic",
  "rule",
  "choices",
  "__component",
  "id",
  "span",
  "label",
]);

interface DynamicSource {
  type?: string;
  path?: string;
  serviceCode?: string;
}

interface DynamicEntry {
  enabled?: boolean;
  type?: string;
  target?: string;
  source?: DynamicSource;
}

interface OutputCondition {
  scope: string;
  schema?: unknown;
}

interface OutputRule {
  effect: string;
  condition?: OutputCondition;
}

interface Control {
  component: string;
  label?: string;
  dynamic?: DynamicEntry;
  rule?: OutputRule;
  options: Record<string, unknown>;
}

interface HorizontalLayout {
  type: "HorizontalLayout";
  elements: Control[];
}

export type OutputElement = Control | HorizontalLayout;

interface MappedEntry {
  componentRaw: string;
  component: string;
  span: number;
  label?: string;
  dynamic?: DynamicEntry;
  rule?: OutputRule;
  options: Record<string, unknown>;
}

function pascalType(component: string): string {
  const name = component.split(".")[1] ?? component;
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}


function toRule(raw: unknown): OutputRule | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as { effect?: string; condition?: { scope?: string; schema?: unknown } };
  if (!r.effect) return undefined;
  const out: OutputRule = { effect: r.effect };
  const c = r.condition;
  if (c?.scope) {
    out.condition = {
      scope: toScopePath(c.scope),
      ...(c.schema !== undefined && c.schema !== null ? { schema: c.schema } : {}),
    };
  }
  return out;
}

function sanitizeComponent(val: unknown): unknown {
  if (!val || typeof val !== "object" || Array.isArray(val)) return val;
  const obj = val as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "id" || k === "__component") continue;
    out[k] = sanitizeComponent(v);
  }
  return out;
}

function toMapped(entry: ZoneEntry): MappedEntry {
  const raw = entry as {
    __component: string;
    id?: number;
    span?: string;
    componentId?: string;
    label?: string;
    dynamic?: unknown;
    [k: string]: unknown;
  };

  const { __component, id, span, componentId, label, dynamic, rule: rawRule, type: rawType, ...rest } = raw;

  const isInput = __component.startsWith("input.");
  const resolvedId = componentId ?? String(id ?? "");
  const options: Record<string, unknown> = { id: toSchemaPath(resolvedId) };
  if (!isInput && rawType !== null && rawType !== undefined) options.variant = rawType;
  for (const [k, v] of Object.entries(rest)) {
    if (!LIFTED_FIELDS.has(k) && v !== null && v !== undefined) {
      options[k] = k === "dataSource" ? sanitizeComponent(v) : v;
    }
  }

  return {
    componentRaw: __component,
    component: pascalType(__component),
    span: Number(span ?? 12),
    label: label ?? undefined,
    dynamic,
    rule: toRule(rawRule),
    options,
  };
}

function toControl(mapped: MappedEntry): Control {
  const ctrl: Control = { component: mapped.component, options: mapped.options };
  if (mapped.label) ctrl.label = mapped.label;
  if (mapped.dynamic) ctrl.dynamic = mapped.dynamic;
  if (mapped.rule) ctrl.rule = mapped.rule;
  return ctrl;
}

export function transformZone(entries: ZoneEntry[]): OutputElement[] {
  if (!entries?.length) return [];

  const result: OutputElement[] = [];
  const mapped = entries.map(toMapped);
  let i = 0;
  while (i < mapped.length) {
    const cur = mapped[i];
    const next = mapped[i + 1];
    if (cur.span === 6 && next?.span === 6) {
      result.push({
        type: "HorizontalLayout",
        elements: [toControl(cur), toControl(next)],
      });
      i += 2;
    } else {
      result.push(toControl(cur));
      i++;
    }
  }

  return result;
}
