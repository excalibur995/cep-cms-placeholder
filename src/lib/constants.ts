import { UID } from "./webhooks/webhook.types";

export const WEBHOOK_URL = process.env.WEBHOOK_URL || "";

export const NOTIFICATION_TEMPLATE_API_URL =
  process.env.NOTIFICATION_TEMPLATE_API_URL || "http://localhost:3001/mbpns/v5/notification-template";

export const NOTIFICATION_TEMPLATE_UID = "api::notification-template.notification-template";

export const WEBHOOK_EVENT_MAP = {
  create: "entry.create",
  update: "entry.update",
  publish: "entry.publish",
  unpublish: "entry.unpublish",
  delete: "entry.delete",
} as const;

export const WEBHOOK_EXCLUDED_UIDS: ReadonlySet<UID> = new Set([]);

export const WEBHOOK_UID_CONFIG: Readonly<Partial<Record<UID, string>>> = {};

export const DANGEROUS_TAG = /<(script|iframe|object|embed|link|meta|svg|img|form|input|button)[^>]*>/i;
export const EVENT_HANDLER = /\bon\w+\s*=/i;
export const JS_PROTOCOL = /javascript\s*:/i;
