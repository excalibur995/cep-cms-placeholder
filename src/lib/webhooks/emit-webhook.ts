import crypto from "crypto";

const keys = ["uid", "version", "updatedBy", "updatedAt", "screenId", "moduleName", "locale"] as const;

export default async function emitWebhook(url: string, event: string, entry: Record<string, any>) {
  try {
    const payload = { event } as any;
    keys.forEach((key) => {
      if (entry[key]) payload[key] = entry[key];
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
    strapi.log.error("Error emitting screen:", error);
  }
}
