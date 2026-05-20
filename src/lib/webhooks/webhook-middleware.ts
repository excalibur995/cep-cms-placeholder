import {WEBHOOK_EVENT_MAP, WEBHOOK_EXCLUDED_UIDS, WEBHOOK_UID_CONFIG, WEBHOOK_URL} from "../constants";
import emitWebhook from "./emit-webhook";
import {Context, Next} from "./webhook.types";

const recentEmits = new Set<string>();
const recentCreates = new Set<string>();

export async function webhookMiddleware(context: Context, next: Next) {
    const result = (await next()) as any;

    if (WEBHOOK_EXCLUDED_UIDS.has(context.uid)) return result;

    const event = WEBHOOK_EVENT_MAP[context.action];
    if (!event) return result;

    const doc = result?.entries?.[0] ?? result;
    if (!doc?.documentId) return result;

    const ctx = strapi.requestContext.get();
    const user = ctx?.state?.user ?? null;
    const updatedBy: string | undefined = user?.email ?? ctx?.state?.auth?.credentials?.name ?? undefined;

    if (context.action === "update" && recentCreates.has(doc.documentId)) return result;

    if (context.action === "create") {
        recentCreates.add(doc.documentId);
        setTimeout(() => recentCreates.delete(doc.documentId), 2000);
    }

    const key = `${event}:${doc.documentId}`;
    if (recentEmits.has(key)) return result;
    recentEmits.add(key);
    setTimeout(() => recentEmits.delete(key), 2000);

    const url = WEBHOOK_UID_CONFIG[context.uid] ?? WEBHOOK_URL;
    await emitWebhook(url, event, {...doc, updatedBy, uid: context.uid});
    return result;
}
