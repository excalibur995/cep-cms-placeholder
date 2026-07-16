/**
 * receipt-template router
 */

export default {
  routes: [
    { method: "GET", path: "/receipt-templates", handler: "receipt-template.find", config: { auth: false } },
    { method: "POST", path: "/receipt-templates", handler: "receipt-template.create", config: { auth: false } },
    { method: "PUT", path: "/receipt-templates/:id", handler: "receipt-template.update", config: { auth: false } },
    { method: "DELETE", path: "/receipt-templates/:id", handler: "receipt-template.delete", config: { auth: false } },
    { method: "GET", path: "/receipt-templates/:receiptTemplateId", handler: "receipt-template.findByReceiptTemplateId", config: { auth: false } },
  ],
};
