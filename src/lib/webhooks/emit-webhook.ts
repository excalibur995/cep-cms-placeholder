import crypto from "crypto";
import { NOTIFICATION_TEMPLATE_API_URL, NOTIFICATION_TEMPLATE_UID } from "../constants";

const staticKeys = ["uid", "version", "updatedBy", "updatedAt", "moduleName", "locale"] as const;

const NOTIFICATION_TEMPLATE_EVENT_ROUTES: Record<string, { url: string; method: "POST" | "PUT" }> = {
  "entry.create": { url: NOTIFICATION_TEMPLATE_API_URL, method: "POST" },
  "entry.update": { url: NOTIFICATION_TEMPLATE_API_URL, method: "PUT" },
  "entry.delete": { url: `${NOTIFICATION_TEMPLATE_API_URL}/soft-delete`, method: "PUT" },
};


async function emitNotificationTemplate(event: string, entry: Record<string, any>) {
  const route = NOTIFICATION_TEMPLATE_EVENT_ROUTES[event];
  if (!route) return;

  try {
    const res = await fetch(route.url, {
      method: route.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (!res.ok) {
      strapi.log.warn(`Notification template API returned ${res.status} for event "${event}"`);
    }
  } catch (error) {
    strapi.log.error(`Error calling notification template API for event "${event}":`, error);
  }
}

export default async function emitWebhook(url: string, event: string, entry: Record<string, any>) {
  if (entry.uid === NOTIFICATION_TEMPLATE_UID) {
    await emitNotificationTemplate(event, entry);
  }

  try {
    const payload = { event } as any;

    staticKeys.forEach((key) => {
      if (entry[key]) payload[key] = entry[key];
    });

    // Auto-include any string field ending in "Id" (e.g. screenId, overlayId, moduleId).
    // Excludes Strapi's internal documentId. Each collection's domain identifier
    // surfaces without any per-collection config.
    Object.keys(entry).forEach((key) => {
      if (key === "documentId") return;
      if (!/Id$/.test(key)) return;
      const value = entry[key];
      if (typeof value === "string" && value.length > 0) payload[key] = value;
    });

    payload.entry = crypto.createHash("sha256").update(JSON.stringify(entry)).digest("hex");

    if (!url) return;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      strapi.log.warn(`Webhook returned ${res.status} for event "${event}"`);
    }
  } catch (error) {
    strapi.log.error("Error emitting webhook:", error);
  }
}
