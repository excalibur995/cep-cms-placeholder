type ZoneEntry = Record<string, unknown>;

const LIFTED_FIELDS = new Set([
  "componentId",
  "required",
  "type",
  "minLength",
  "maxLength",
  "messages",
  "dynamic",
  "dependsOn",
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
  dynamic?: DynamicEntry;
  dependsOn?: string[];
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
  dynamic?: DynamicEntry;
  dependsOn?: string[];
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
      scope: c.scope.startsWith("#/") ? c.scope : `#/properties/${c.scope}`,
      ...(c.schema !== undefined && c.schema !== null ? { schema: c.schema } : {}),
    };
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

  const { __component, id, span, componentId, label, dynamic, dependsOn: rawDependsOn, rule: rawRule, ...rest } = raw;

  const resolvedId = componentId ?? String(id ?? "");
  const options: Record<string, unknown> = { id: resolvedId };
  if (label) options.label = label;
  for (const [k, v] of Object.entries(rest)) {
    if (!LIFTED_FIELDS.has(k) && v !== null && v !== undefined) {
      options[k] = v;
    }
  }

  const dependsOn =
    Array.isArray(rawDependsOn) && rawDependsOn.length
      ? (rawDependsOn as Array<{ componentId: string }>).map((d) => d.componentId).filter(Boolean)
      : undefined;

  return {
    componentRaw: __component,
    component: pascalType(__component),
    span: Number(span ?? 12),
    dynamic,
    dependsOn,
    rule: toRule(rawRule),
    options,
  };
}

function toControl(mapped: MappedEntry): Control {
  const ctrl: Control = { component: mapped.component, options: mapped.options };
  if (mapped.dynamic) ctrl.dynamic = mapped.dynamic;
  if (mapped.dependsOn?.length) ctrl.dependsOn = mapped.dependsOn;
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
