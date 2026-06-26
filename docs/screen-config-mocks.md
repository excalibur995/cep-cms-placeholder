# Screen Config Mocks

Mock API responses for all template screens in the apply journey.
These represent the shape returned by `GET /api/screen-configs/:screenId`.

---

## Emergency Contact (`emergency-contact-template`)

```json
{
  "screenId": "emergency-contact-details",
  "template": "form",
  "components": {
    "emergencyContactTitle": {
      "type": "title",
      "value": "Emergency contact details",
      "weight": "700"
    },
    "emergencyMobileNumber": {
      "type": "phone",
      "label": "Mobile number",
      "placeholder": "12 3456 7890",
      "prefix": "08",
      "required": true,
      "disabled": false,
      "messages": {
        "required": "Mobile number is required"
      }
    },
    "emergencyFullName": {
      "type": "string",
      "label": "Full name as per e-KTP",
      "placeholder": "Enter full name",
      "required": true,
      "disabled": false,
      "messages": {
        "required": "Full name is required"
      }
    },
    "emergencyRelationship": {
      "type": "select",
      "label": "Relationship",
      "placeholder": "Select relationship",
      "required": true,
      "disabled": false,
      "values": [
        { "displayValue": "Spouse", "value": "spouse" },
        { "displayValue": "Child", "value": "child" },
        { "displayValue": "Older brother/sister", "value": "older_sibling" },
        { "displayValue": "Younger brother/sister", "value": "younger_sibling" },
        { "displayValue": "Parents", "value": "parents" },
        { "displayValue": "Others", "value": "others" },
        { "displayValue": "Human resource department (HRD)", "value": "hrd" }
      ],
      "messages": {
        "required": "Please select a relationship"
      }
    },
    "emergencyContactNext": {
      "type": "primary",
      "label": "Next",
      "size": "lg",
      "disabled": false,
      "loading": false,
      "action": { "type": "submit" }
    }
  }
}
```

**Component keys and their effect when absent:**

| Key | Absent = hidden |
|-----|-----------------|
| `emergencyContactTitle` | Title row hidden |
| `emergencyMobileNumber` | Mobile number field hidden (not validated) |
| `emergencyFullName` | Full name field hidden (not validated) |
| `emergencyRelationship` | Relationship dropdown hidden (not validated) |
| `emergencyContactNext` | Footer Next button hidden |

---

## Correspondence Address (`correspondence-address-template`)

```json
{
  "screenId": "correspondence-address",
  "template": "form",
  "components": {
    "correspondenceTitle": {
      "type": "title",
      "value": "Correspondence address",
      "weight": "700"
    },
    "correspondenceSubtitle": {
      "type": "body",
      "value": "Your card will be sent to the selected correspondence address below."
    },
    "addressType": {
      "type": "select",
      "label": "Address type",
      "placeholder": "Select address type",
      "required": true,
      "disabled": false,
      "values": [
        { "displayValue": "Home / Residential", "value": "home" },
        { "displayValue": "Office", "value": "office" },
        { "displayValue": "Other", "value": "other" }
      ],
      "messages": {
        "required": "Address type is required"
      }
    },
    "noAddressState": {
      "type": "empty-state",
      "value": "No address",
      "label": "Tap 'Add address' to save the address details.",
      "placeholder": "Add address"
    },
    "addressDetails": {
      "type": "address-card",
      "label": "Address details",
      "placeholder": "Edit"
    },
    "declaration": {
      "type": "checkbox",
      "label": "I hereby declare and take responsibility that the address provided above is my correct and up-to-date mailing address. I authorise Maybank to use this data for the <card name> application process.",
      "required": true,
      "disabled": false,
      "messages": {
        "required": "Please confirm the declaration"
      }
    },
    "correspondenceNext": {
      "type": "primary",
      "label": "Next",
      "size": "lg",
      "disabled": false,
      "loading": false,
      "action": { "type": "submit" }
    }
  }
}
```

**Component keys and their effect when absent:**

| Key | Absent = hidden |
|-----|-----------------|
| `correspondenceTitle` | Title row hidden |
| `correspondenceSubtitle` | Subtitle body hidden |
| `addressType` | Address type dropdown hidden |
| `noAddressState` | Empty state (illustration + Add link) hidden |
| `addressDetails` | Address card + Edit link hidden |
| `declaration` | Declaration checkbox hidden (not validated) |
| `correspondenceNext` | Footer Next button hidden |

**Runtime visibility rules (driven by hook, not config):**

| State | Visible components |
|-------|--------------------|
| No type selected | `addressType` only (no address/empty state) |
| Type selected, no address data | `addressType` + `noAddressState` |
| Type selected, address data exists | `addressType` + `addressDetails` + `declaration` |

---

## Navigator Config (`apply-cc-new`)

The journey config that sequences the screens. Returned by `GET /api/navigator-configs/:journeyId`.

```json
{
  "journeyId": "apply-cc-new",
  "totalSteps": 5,
  "screens": [
    {
      "id": "ektp",
      "label": "eKTP Details",
      "templateId": "ektp-template",
      "stepNumber": 1
    },
    {
      "id": "cc-ownership",
      "label": "CC Ownership",
      "templateId": "cc-ownership-template",
      "stepNumber": 2
    },
    {
      "id": "emergency-contact",
      "label": "Emergency Contact",
      "templateId": "emergency-contact-template",
      "stepNumber": 3
    },
    {
      "id": "correspondence-address",
      "label": "Correspondence Address",
      "templateId": "correspondence-address-template",
      "stepNumber": 4
    },
    {
      "id": "auto-debit",
      "label": "Auto Debit",
      "templateId": "auto-debit-template",
      "stepNumber": 5
    }
  ]
}
```

---

## ComponentConfig Type Reference

All component objects in a `components` map conform to this shape (all fields optional except `type`):

```json
{
  "type": "title | body | phone | string | select | checkbox | empty-state | address-card | primary | secondary",
  "label": "string",
  "value": "string",
  "placeholder": "string",
  "required": true,
  "disabled": false,
  "prefix": "string",
  "weight": "400 | 600 | 700",
  "size": "sm | md | lg",
  "loading": false,
  "values": [
    { "displayValue": "string", "value": "string" }
  ],
  "messages": {
    "required": "string | null"
  },
  "action": {
    "type": "submit | navigate | back"
  }
}
```
