# New Request for Dropdown Structure

```json
[
  {
    "component": "Dropdown",
    "label": "Province",
    "options": {
      "id": "province",
      "placeholder": "Select province",
      "dataSource": {
        "url": "/api/ref/provinces",
        "responseMap": { "valueKey": "code", "labelKey": "name" }
      }
    }
  },
  {
    "component": "Dropdown",
    "label": "City",
    "options": {
      "id": "city",
      "placeholder": "Select city",
      "dataSource": {
        "url": "/api/ref/cities/:province",
        "depends": "province",
        "responseMap": { "valueKey": "code", "labelKey": "name" }
      }
    }
  }
]
```

so basically the new structure is more for dropdown that need api call to fetch and the one needs to depend on another dropdown value. there will be new component which is `dataSource` that will have properties of

- url: string
- responseMap: { valueKey: string, labelKey: string }
- depends: string (optional)

our current structure right now for this kind of dropdown is in schema is like using url and dependent in schema like json form does, but based on our needs the static dropdown value will be still in schema, but the dynamic dropdown value will be in ui-schema under options. please help adjust the new structure in strapi, remember to update the controller cause its a strapi component related.
