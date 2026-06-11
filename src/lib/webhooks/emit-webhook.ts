import crypto from "crypto";

const staticKeys = ["uid", "version", "updatedBy", "updatedAt", "moduleName", "locale"] as const;

export default async function emitWebhook(url: string, event: string, entry: Record<string, any>) {
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
