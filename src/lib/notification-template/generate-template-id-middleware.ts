import { randomUUID } from "node:crypto";
import { Modules } from "@strapi/strapi";

type Context = Modules.Documents.Middleware.Context;
type Next = () => ReturnType<Modules.Documents.ServiceInstance[keyof Modules.Documents.ServiceInstance]>;

const NOTIFICATION_TEMPLATE_UID = "api::notification-template.notification-template";

export async function generateTemplateIdMiddleware(context: Context, next: Next) {
  if (
    context.uid === NOTIFICATION_TEMPLATE_UID &&
    (context.action === "create" || context.action === "update")
  ) {
    const data = context.params?.data as { templateId?: string } | undefined;
    if (data && !data.templateId) {
      data.templateId = randomUUID();
    }
  }

  return next();
}
