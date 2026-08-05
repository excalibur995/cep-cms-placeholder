/**
 * consent lifecycles
 *
 * Enforce conditional requirements that the schema can't express:
 *  - dynamic consent must carry `htmlContent`
 *  - static consent must carry a `file` (the stored PDF asset)
 */

import { errors } from "@strapi/utils";

const { ApplicationError } = errors;

function validate(data: Record<string, unknown>) {
  if (data.type === "dynamic" && !data.htmlContent) {
    throw new ApplicationError("htmlContent is required for dynamic consent");
  }
  if (data.type === "static" && !data.file) {
    throw new ApplicationError("file (PDF asset) is required for static consent");
  }
}

export default {
  beforeCreate(event: { params: { data: Record<string, unknown> } }) {
    validate(event.params.data);
  },
  beforeUpdate(event: { params: { data: Record<string, unknown> } }) {
    // Partial updates only send changed fields; validate the type/content
    // pairing only when `type` itself is part of this update.
    if (event.params.data.type !== undefined) {
      validate(event.params.data);
    }
  },
};
