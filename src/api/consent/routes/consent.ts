/**
 * consent router
 */

export default {
  routes: [
    { method: "GET", path: "/consents", handler: "consent.find", config: { auth: false } },
    { method: "POST", path: "/consents", handler: "consent.create", config: { auth: false } },
    { method: "PUT", path: "/consents/:id", handler: "consent.update", config: { auth: false } },
    { method: "DELETE", path: "/consents/:id", handler: "consent.delete", config: { auth: false } },
    { method: "GET", path: "/consents/:consentId/file", handler: "consent.streamFile", config: { auth: false } },
    { method: "GET", path: "/consents/:consentId", handler: "consent.findByConsentId", config: { auth: false } },
  ],
};
