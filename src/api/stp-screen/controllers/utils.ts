// "firstName"        → "properties.firstName"
// "personalData.age" → "properties.personalData.properties.age"
export function toSchemaPath(id: string): string {
  return "properties." + id.split(".").join(".properties.");
}

// "firstName"        → "#/properties/firstName"
// "personalData.age" → "#/properties/personalData/properties/age"
export function toScopePath(scope: string): string {
  if (scope.startsWith("#/")) return scope;
  return "#/properties/" + scope.split(".").join("/properties/");
}
