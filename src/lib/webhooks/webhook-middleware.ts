import { WEBHOOK_EVENT_MAP, WEBHOOK_EXCLUDED_UIDS, WEBHOOK_UID_CONFIG, WEBHOOK_URL } from "../constants";
import emitWebhook from "./emit-webhook";
import { Context, Next } from "./webhook.types";

const recentEmits = new Set<string>();
const recentCreates = new Set<string>();

export async function webhookMiddleware(context: Context, next: Next) {
  const result = (await next()) as any;

  if (WEBHOOK_EXCLUDED_UIDS.has(context.uid)) return result;

  const event = WEBHOOK_EVENT_MAP[context.action];
  if (!event) return result;

  // publish/unpublish return { entries: [...] }; create/update return the doc directly.
  const docs: any[] = Array.isArray(result?.entries) ? result.entries : result ? [result] : [];
  if (docs.length === 0) return result;

  const ctx = strapi.requestContext.get();
  const user = ctx?.state?.user ?? null;
  const updatedBy: string | undefined =
    user?.email ?? ctx?.state?.auth?.credentials?.name ?? undefined;

  for (const doc of docs) {
    if (!doc?.documentId) continue;

    if (context.action === "update" && recentCreates.has(doc.documentId)) continue;

    if (context.action === "create") {
      recentCreates.add(doc.documentId);
      setTimeout(() => recentCreates.delete(doc.documentId), 2000);
    }

    // Include locale in key so per-locale events are independent (important for single types)
    const key = `${event}:${doc.documentId}:${doc.locale ?? ""}`;
    if (recentEmits.has(key)) continue;
    recentEmits.add(key);
    setTimeout(() => recentEmits.delete(key), 2000);

    const url = WEBHOOK_UID_CONFIG[context.uid] ?? WEBHOOK_URL;
    await emitWebhook(url, event, { ...doc, updatedBy, uid: context.uid });
  }

  return result;
}
