import { DANGEROUS_TAG, EVENT_HANDLER, JS_PROTOCOL } from "./constants";

export function containsDangerousContent(value: unknown): boolean {
  switch (true) {
    case typeof value === "string":
      return (
        DANGEROUS_TAG.test(value as string) || EVENT_HANDLER.test(value as string) || JS_PROTOCOL.test(value as string)
      );

    case Array.isArray(value):
      return (value as unknown[]).some(containsDangerousContent);

    case value !== null && typeof value === "object":
      return Object.values(value as Record<string, unknown>).some(containsDangerousContent);

    default:
      return false;
  }
}
