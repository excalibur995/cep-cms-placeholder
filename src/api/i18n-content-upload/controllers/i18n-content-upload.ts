import fs from "fs/promises";
import type { Context } from "koa";
import { containsDangerousContent } from "../../../lib/utils";

export default {
  async upload(ctx: Context) {
    const filesMap = ctx.request.files as Record<string, any> | undefined;
    const rawFiles = Object.values(filesMap ?? {})
      .flat()
      .filter(Boolean);

    if (!rawFiles.length) {
      ctx.status = 400;
      ctx.body = { error: "No files uploaded." };
      return;
    }

    const updatedBy: string | undefined = ctx.state?.user?.email ?? ctx.state?.auth?.credentials?.name ?? undefined;

    const results = [];
    const errors = [];

    for (const file of rawFiles) {
      const filename: string = file.originalFilename ?? file.name ?? "";
      const base = filename.replace(/\.json$/i, "");
      const parts = base.split("_");

      if (parts.length < 2) {
        errors.push({ filename, error: "Filename must be <moduleId>_<locale>.json" });
        continue;
      }

      if (!filename.toLowerCase().endsWith(".json") || !file.mimetype?.includes("json")) {
        errors.push({ filename, error: "Only JSON files are accepted." });
        continue;
      }

      const locale = parts[parts.length - 1];
      const moduleId = parts.slice(0, -1).join("_");
      let data: Record<string, any>;

      try {
        const raw = await fs.readFile(file.filepath);
        data = JSON.parse(raw.toString("utf-8"));
      } catch {
        errors.push({ filename, error: "Invalid JSON or unreadable file" });
        continue;
      }

      if (containsDangerousContent(data)) {
        errors.push({ filename, error: "File contains dangerous tags or scripts and was rejected." });
        continue;
      }

      const existing = await strapi.documents("api::i18n-content.i18n-content").findMany({
        locale,
        filters: { moduleId },
        sort: { version: "desc" },
        limit: 1,
      });

      const latest = (existing as any[])?.[0];
      const version = (latest?.version ?? 0) + 1;

      let entry: any;
      let action: "created" | "updated";

      if (latest?.documentId) {
        entry = await strapi.documents("api::i18n-content.i18n-content").update({
          documentId: latest.documentId,
          locale,
          data: { moduleId, version, content: data },
        });
        action = "updated";
      } else {
        entry = await strapi.documents("api::i18n-content.i18n-content").create({
          locale,
          data: { moduleId, version, content: data },
        });
        action = "created";
      }

      results.push({ filename, action, moduleId, locale, version, id: entry.documentId, updatedBy });
    }

    const body: Record<string, any> = { results };
    if (errors.length) body.errors = errors;
    ctx.body = body;
  },
};
