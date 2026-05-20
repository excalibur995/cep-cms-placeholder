import {UID} from "./webhooks/webhook.types";

export const WEBHOOK_URL = process.env.WEBHOOK_URL || "";

export const WEBHOOK_EVENT_MAP = {
    create: "entry.create",
    update: "entry.update",
    publish: "entry.publish",
    unpublish: "entry.unpublish",
    delete: "entry.delete",
} as const;

// Add UIDs here to control which content types not triggering webhooks.
export const WEBHOOK_EXCLUDED_UIDS: ReadonlySet<UID> = new Set([]);


// Add an entry here to route a specific content type to a different webhook URL.
// Omit a UID to use the global WEBHOOK_URL.
export const WEBHOOK_UID_CONFIG: Readonly<Partial<Record<UID, string>>> = {
    "api::stp-screen.stp-screen": WEBHOOK_URL
}
