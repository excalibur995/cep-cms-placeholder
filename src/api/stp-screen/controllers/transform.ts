const DISPLAY_NON_COMBINABLE = new Set(["action", "input"]);
const BUTTON_COMPONENT = "action.button";

type ZoneEntry = Record<string, unknown>;

// Fields lifted to Control level or used as binding key (not placed inside options)
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

interface FlatItem {
  id: string;
  [key: string]: unknown;
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
  type: "Control";
  component: string;
  label?: string;
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
  category: string;
  span: number;
  componentId?: string;
  label?: string;
  dynamic?: DynamicEntry;
  dependsOn?: string[];
  rule?: OutputRule;
  options: Record<string, unknown>;
  flatItem: FlatItem;
}

function pascalType(component: string): string {
  const name = component.split(".")[1] ?? component;
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function isMergeable(componentRaw: string): boolean {
  const category = componentRaw.split(".")[0];
  if (componentRaw === BUTTON_COMPONENT) return true;
  return !DISPLAY_NON_COMBINABLE.has(category);
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

  // Build options: everything not in LIFTED_FIELDS
  const options: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (!LIFTED_FIELDS.has(k) && v !== null && v !== undefined) {
      options[k] = v;
    }
  }

  // Build flat item (for merged items array): all non-internal fields spread flat
  const resolvedId = componentId ?? String(id ?? "");
  const flatItem: FlatItem = { id: resolvedId };
  for (const [k, v] of Object.entries(rest)) {
    if (!LIFTED_FIELDS.has(k) && v !== null && v !== undefined) {
      flatItem[k] = v;
    }
  }
  if (label) flatItem.label = label;

  const dependsOn =
    Array.isArray(rawDependsOn) && rawDependsOn.length
      ? (rawDependsOn as Array<{ componentId: string }>).map((d) => d.componentId).filter(Boolean)
      : undefined;

  return {
    componentRaw: __component,
    component: pascalType(__component),
    category: __component.split(".")[0],
    span: Number(span ?? 12),
    componentId: componentId || undefined,
    label: label || undefined,
    dynamic,
    dependsOn,
    rule: toRule(rawRule),
    options,
    flatItem,
  };
}

function toControl(mapped: MappedEntry): Control {
  const options = mapped.componentId ? { id: mapped.componentId, ...mapped.options } : mapped.options;
  const ctrl: Control = { type: "Control", component: mapped.component, options };
  if (mapped.label) ctrl.label = mapped.label;
  if (mapped.dynamic) ctrl.dynamic = mapped.dynamic;
  if (mapped.dependsOn?.length) ctrl.dependsOn = mapped.dependsOn;
  if (mapped.rule) ctrl.rule = mapped.rule;
  return ctrl;
}

interface SpannedEntry {
  element: OutputElement;
  componentRaw: string;
  component: string;
  flatItem: FlatItem;
  isMergeableEl: boolean;
}

export function transformZone(entries: ZoneEntry[]): OutputElement[] {
  if (!entries?.length) return [];

  const mapped = entries.map(toMapped);

  // Step 1: span grouping
  const spanned: SpannedEntry[] = [];
  let i = 0;
  while (i < mapped.length) {
    const cur = mapped[i];
    const next = mapped[i + 1];
    if (cur.span === 6 && next?.span === 6) {
      spanned.push({
        element: {
          type: "HorizontalLayout",
          elements: [toControl(cur), toControl(next)],
        },
        componentRaw: "",
        component: "HorizontalLayout",
        flatItem: cur.flatItem,
        isMergeableEl: false,
      });
      i += 2;
    } else {
      spanned.push({
        element: toControl(cur),
        componentRaw: cur.componentRaw,
        component: cur.component,
        flatItem: cur.flatItem,
        isMergeableEl: isMergeable(cur.componentRaw),
      });
      i++;
    }
  }

  // Step 2: same-type merge for mergeable components
  const result: OutputElement[] = [];
  let j = 0;
  while (j < spanned.length) {
    const cur = spanned[j];

    if (!cur.isMergeableEl) {
      result.push(cur.element);
      j++;
      continue;
    }

    const run: FlatItem[] = [cur.flatItem];
    let k = j + 1;
    while (k < spanned.length) {
      const cand = spanned[k];
      if (!cand.isMergeableEl || cand.component !== cur.component) break;
      run.push(cand.flatItem);
      k++;
    }

    if (run.length === 1) {
      result.push(cur.element);
    } else {
      const ctrl = cur.element as Control;
      result.push({
        type: "Control",
        component: ctrl.component,
        ...(ctrl.label ? { label: ctrl.label } : {}),
        ...(ctrl.dynamic ? { dynamic: ctrl.dynamic } : {}),
        options: { items: run },
      });
    }
    j = k;
  }

  return result;
}
