# STP Screen API Contract

Reference for backend engineers integrating with or extending the STP screen API.

---

## Endpoint

```
GET /api/stp-screens/:screenId
```

Returns the latest published version of a screen. `:screenId` is the human-readable `screenId` string (e.g. `complete-form-example`), not the Strapi document UUID.

---

## Response Envelope

```json
{
  "screenId": "complete-form-example",
  "version": 1,
  "schema": { ... },
  "uiSchema": { ... },
  "data": { ... }
}
```

| Field | Type | Description |
|---|---|---|
| `screenId` | string | Authored string identifier |
| `version` | integer | Schema version (incremented on breaking changes) |
| `schema` | object | JSON Schema describing the form data model |
| `uiSchema` | object | Layout tree — header/body/footer zones + optional overlay map |
| `data` | object | Initial form state with empty/default values |

---

## `schema`

A JSON Schema object representing every input field on the screen (including overlay inputs).

### Top-level structure

```json
{
  "type": "object",
  "properties": {
    "fieldName": { ... }
  },
  "required": ["fieldName"]
}
```

| Field | Type | Description |
|---|---|---|
| `url` | string? | Optional screen-level URL. Present if authored on the stp-screen record. No longer used for endpoint-based option fetching — per-field remote sources are in `options.dataSource.url`. |
| `type` | `"object"` | Always `"object"` |
| `properties` | object | Map of field names to property definitions |
| `required` | string[] | Field names that must be non-empty before submission |

### Per-property fields

| Field | Type | When present | Description |
|---|---|---|---|
| `type` | string | Always (for input fields) | JSON Schema primitive: `string`, `number`, `integer`, `boolean`, `array` |
| `minLength` | integer | Text inputs | Minimum character count |
| `maxLength` | integer | Text inputs | Maximum character count |
| `messages` | object | When any validation message is authored | Keyed validation error strings (see below) |
| `oneOf` | array | Dropdown, RadioButton, SearchInput with static choices | Static choice list for single-select fields |
| `items.oneOf` | array | Checkbox | Static choice list for multi-select fields; `type` is `"array"`, `uniqueItems: true` |
| `properties` | object | Nested field groups | Child properties when `componentId` uses dot-notation |
| `required` | string[] | Nested field groups | Required children within a nested object |

### `messages` object

```json
"messages": {
  "required": "Please select a country",
  "email": "Enter a valid email address",
  "minLength": "Minimum 5 characters",
  "maxLength": "At most 200 characters",
  "pattern": "Invalid format"
}
```

NGA reads this to display field-level validation errors. All keys are optional — only author the messages you want to customise.

### `oneOf` — static choices (single-select)

```json
"oneOf": [
  { "const": "MY", "title": "Malaysia" },
  { "const": "SG", "title": "Singapore" }
]
```

Used by: `Dropdown`, `RadioButton`, `SearchInput`.

- `const` — the value stored in `data` when the user selects this option
- `title` — the display label shown in the UI

### `items.oneOf` — static choices (multi-select)

```json
"type": "array",
"uniqueItems": true,
"items": {
  "oneOf": [
    { "const": "news", "title": "News & Updates" },
    { "const": "promos", "title": "Promotions" }
  ]
}
```

Used by: `Checkbox`. The field value is an array of selected `const` values.

### Nested properties

`componentId` values using dot-notation (e.g. `personalData.age`) produce nested schema entries:

```json
"properties": {
  "personalData": {
    "type": "object",
    "properties": {
      "age": { "type": "integer", "minLength": 18 },
      "height": { "type": "number" }
    },
    "required": ["age"]
  }
}
```

The corresponding `options.id` in uiSchema is `properties.personalData.properties.age`.

---

## `uiSchema`

The layout tree. Drives how NGA renders the screen.

### Top-level structure

```json
{
  "header": { "type": "VerticalLayout", "elements": [...] },
  "body":   { "type": "VerticalLayout", "elements": [...] },
  "footer": { "type": "VerticalLayout", "elements": [...] },
  "overlay": {
    "confirmLeave": { "type": "modal", "header": {...}, "body": {...}, "footer": {...} }
  }
}
```

Each of `header`, `body`, `footer` is a `VerticalLayout`. `overlay` is only present when the screen has linked overlay records.

### Element types

#### Control

The standard element. Represents one component on the screen.

```json
{
  "component": "TextInput",
  "label": "Phone Number",
  "options": {
    "id": "properties.phoneNumber",
    "placeholder": "+60 12 345 6789",
    "disabled": false
  },
  "dynamic": { ... },
  "rule": { ... }
}
```

| Field | Type | Description |
|---|---|---|
| `component` | string | PascalCase component name (see [Component Name Mapping](#component-name-mapping)) |
| `label` | string? | Display label (absent for display-only components like Typo) |
| `options` | object | All component-specific props. Always includes `id`. |
| `options.id` | string | Schema path (`properties.fieldName`). NGA binds the control to `data[fieldName]`. |
| `options.dataSource` | object? | Remote option loading config for choice inputs (see [Data Source](#data-source)) |
| `dynamic` | object? | Reactive pre-fill / content injection (see [Dynamic](#dynamic)) |
| `rule` | object? | Conditional visibility/interactivity rule (see [Rules](#rules)) |

**Note on `options.variant`**: For non-input display components (e.g. `Typo`), the Strapi `type` field (e.g. `"title1"`) is emitted as `options.variant` to avoid collision with the structural `type` field used in layouts.

#### HorizontalLayout

Wraps two consecutive `span=6` elements side by side.

```json
{
  "type": "HorizontalLayout",
  "elements": [
    { "component": "TextInput", "label": "First Name", "options": { "id": "properties.firstName", ... } },
    { "component": "TextInput", "label": "Last Name",  "options": { "id": "properties.lastName",  ... } }
  ]
}
```

In Strapi authoring: set `span` to `6` on two consecutive items in the same zone. The transform auto-detects the pair and wraps them.

---

## Rules

Rules conditionally show, hide, enable, or disable a component based on another field's value.

```json
"rule": {
  "effect": "SHOW",
  "condition": {
    "scope": "#/properties/contactMethod",
    "schema": { "const": "phone" }
  }
}
```

| Field | Values | Description |
|---|---|---|
| `effect` | `SHOW` \| `HIDE` \| `ENABLE` \| `DISABLE` | What happens when the condition is satisfied |
| `condition.scope` | JSON Pointer string | Path to the controlling field, e.g. `#/properties/country` |
| `condition.schema` | object | JSON Schema snippet evaluated against the controlling field's current value |

### Effect semantics

| Effect | Condition true | Condition false |
|---|---|---|
| `SHOW` | Component is visible | Component is hidden |
| `HIDE` | Component is hidden | Component is visible |
| `ENABLE` | Component is interactive | Component is disabled |
| `DISABLE` | Component is disabled | Component is interactive |

### `condition.schema` forms

| Form | Example | Meaning |
|---|---|---|
| String const | `{ "const": "phone" }` | Field equals the string `"phone"` |
| Boolean const | `{ "const": true }` | Field equals `true` |
| Enum | `{ "enum": ["phone", "sms"] }` | Field value is in the list |

---

## Dynamic

Pre-fills a field value or injects content from an external source at runtime.

```json
"dynamic": {
  "enabled": true,
  "type": "VALUE",
  "target": "defaultValue",
  "source": {
    "type": "FACT",
    "path": "userEmail",
    "serviceCode": null
  }
}
```

| Field | Values | Description |
|---|---|---|
| `enabled` | boolean | Whether dynamic resolution is active |
| `type` | `VALUE` \| `CONTENT` \| `OPTIONS` | What kind of data is being resolved |
| `target` | `defaultValue` \| `label` \| `items` | Where to inject the resolved value in the component |
| `source.type` | `FACT` \| `SERVICE` | Where to read the value from |
| `source.path` | string | Fact store key (when `source.type` is `FACT`) |
| `source.serviceCode` | string? | Service identifier (when `source.type` is `SERVICE`) |

### `dynamic.type` values

| Value | Use case |
|---|---|
| `VALUE` | Pre-fill a field's default value (e.g. email from user profile fact) |
| `CONTENT` | Inject translated or personalised text into a display component |
| `OPTIONS` | Load the choice list for a dropdown/radio from a service response |

---

## Data Source

`options.dataSource` on a uiSchema Control tells NGA how to load choice options from a remote API. Used by `Dropdown`, `RadioButton`, and `SearchInput` when choices are not static.

```json
{
  "component": "Dropdown",
  "label": "Region",
  "options": {
    "id": "properties.region",
    "dataSource": {
      "url": "https://stp-api.example.com/regions",
      "depends": "country",
      "responseMap": {
        "valueKey": "code",
        "labelKey": "name"
      }
    }
  }
}
```

| Field | Type | Description |
|---|---|---|
| `url` | string | Full URL to call for options |
| `depends` | string? | Name of the parent field whose value is sent as a query param when fetching options. When present, NGA re-fetches and clears this field's value whenever the parent changes. |
| `responseMap.valueKey` | string | Key in each response item to use as the choice `const` (stored value) |
| `responseMap.labelKey` | string | Key in each response item to use as the choice display label |

### Cascade dropdowns

```json
"uiSchema": {
  "body": {
    "type": "VerticalLayout",
    "elements": [
      {
        "component": "Dropdown",
        "label": "Country",
        "options": {
          "id": "properties.country",
          "dataSource": {
            "url": "https://stp-api.example.com/countries",
            "responseMap": { "valueKey": "code", "labelKey": "name" }
          }
        }
      },
      {
        "component": "Dropdown",
        "label": "Region",
        "options": {
          "id": "properties.region",
          "dataSource": {
            "url": "https://stp-api.example.com/regions",
            "depends": "country",
            "responseMap": { "valueKey": "code", "labelKey": "name" }
          }
        }
      }
    ]
  }
}
```

NGA flow:
1. Screen load → fetch `url` for `country` options
2. User selects `country = "MY"` → clear `region` value + fetch `{url}?country=MY` for region options

---

## Overlay / Modal System

Overlays are separate Strapi records linked to the screen. They appear as a keyed map in `uiSchema.overlay`.

### In the response

```json
"uiSchema": {
  "header": { ... },
  "body": { ... },
  "footer": { ... },
  "overlay": {
    "confirmLeave": {
      "type": "modal",
      "header": { "type": "VerticalLayout", "elements": [...] },
      "body":   { "type": "VerticalLayout", "elements": [...] },
      "footer": { "type": "VerticalLayout", "elements": [...] }
    },
    "promoInfo": {
      "type": "bottom-sheet",
      "header": { ... },
      "body":   { ... },
      "footer": { ... }
    }
  }
}
```

### Overlay `type` enum

| Value | Description |
|---|---|
| `modal` | Centred dialog with backdrop |
| `bottom-sheet` | Slides up from the bottom |
| `full-screen` | Occupies the full screen |
| `side-sheet` | Slides in from the side |

### Triggering an overlay

A `Button` component with `action.type: "show_modal"` opens the overlay:

```json
{
  "component": "Button",
  "label": "Leave Application",
  "options": {
    "id": "properties.leaveBtn",
    "variant": "secondary",
    "action": {
      "type": "show_modal",
      "payload": { "overlayId": "confirmLeave" }
    }
  }
}
```

### Closing an overlay

A button inside the overlay with `action.type: "close_modal"`:

```json
{
  "component": "Button",
  "label": "Cancel",
  "options": {
    "id": "properties.cancelLeave",
    "action": { "type": "close_modal" }
  }
}
```

### Schema integration

Input fields inside overlays are merged into the root `schema.properties` and `data`. They share the same form context as the main screen — overlay inputs can reference and be referenced by main-screen fields via `rule.condition.scope`.

---

## `data`

The initial form state. NGA initialises its form store from this object.

```json
"data": {
  "firstName": "",
  "lastName": "",
  "notifications": [],
  "personalData": {
    "age": "",
    "height": ""
  }
}
```

| Schema type | Initial `data` value |
|---|---|
| `string`, `number`, `integer`, `boolean` | `""` |
| `array` (checkbox multi-select) | `[]` |
| `object` (nested group) | `{ childField: "" }` recursively |

---

## Action Types

Applies to `Button.options.action.type`:

| Value | Payload fields | Description |
|---|---|---|
| `navigate` | `target: string` | Navigate to another screen by `screenId` |
| `open_camera` | `mode: string`, `target?: string` | Open device camera; `target` is the screenId to navigate to after capture |
| `open_pdf` | `url: string` | Open PDF viewer with the given URL |
| `show_modal` | `overlayId: string` | Show the overlay keyed by `overlayId` in `uiSchema.overlay` |
| `close_modal` | — | Dismiss the currently visible overlay |
| `submit` | — | Submit the form |
| `use_sdk` | *(SDK-specific)* | Call a native SDK function |

---

## Component Name Mapping

Strapi `__component` values are transformed to PascalCase `component` names in uiSchema:

| Strapi `__component` | uiSchema `component` | Notes |
|---|---|---|
| `input.text-input` | `TextInput` | |
| `input.dropdown` | `Dropdown` | Has `oneOf` in schema |
| `input.radio-button` | `RadioButton` | Has `oneOf` in schema |
| `input.checkbox` | `Checkbox` | Has `items.oneOf` in schema, array type |
| `input.toggle` | `Toggle` | Boolean type |
| `input.pin-input` | `PinInput` | `options.numberOfDigits`, `inputMode` |
| `input.slider` | `Slider` | `options.min`, `max`, `step` |
| `input.number-input-stepper` | `NumberInputStepper` | `options.min`, `max`, `step`, `editable` |
| `input.search-input` | `SearchInput` | Can have `oneOf` or `endpoint` |
| `input.uploader` | `Uploader` | `options.maxFiles`, `maxFileSizeBytes`, `autoUpload` |
| `action.button` | `Button` | `options.variant`, `size`, `type`, `action` |
| `action.chip` | `Chip` | |
| `core.typo` | `Typo` | `options.variant` = typography style (title1, body, etc.) |
| `core.avatar` | `Avatar` | |
| `navigation.top-navigation` | `TopNavigation` | `options.title` |
| `navigation.toolbar` | `Toolbar` | |
| `navigation.section-header` | `SectionHeader` | |
| `navigation.bottom-navigation` | `BottomNavigation` | |
| `status-and-feedback.progress-indicator` | `ProgressIndicator` | `options.currentStep`, `totalSteps`, `indicatorType` |
| `status-and-feedback.alert-banner` | `AlertBanner` | |
| `status-and-feedback.badge` | `Badge` | |
| `status-and-feedback.toast` | `Toast` | |
| `container.list` | `List` | Has `options.items[]` with label/value/iconName |
| `container.card` | `Card` | |
| `container.divider` | `Divider` | |
| `container.banner` | `Banner` | |
| `container.accordion` | `Accordion` | |
| `container.bento` | `Bento` | |
| `asset.image` | `Image` | May have `dynamic` for fact-based src |
| `asset.icon` | `Icon` | |

---

## Full Example

See [`our-stp-response-example.json`](./our-stp-response-example.json) for a complete response showing:
- All 10 input component types
- All 4 rule effects (SHOW, HIDE, ENABLE, DISABLE)
- All 3 condition schema forms (const string, const boolean, enum)
- Dynamic source from a FACT
- Nested property group (`personalData.*`)
- HorizontalLayout (span-6 pair)
- Overlay modal and bottom-sheet with show_modal / close_modal actions
