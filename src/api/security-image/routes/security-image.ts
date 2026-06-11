/**
 * security-image router
 */

export default {
  routes: [
    { method: "GET", path: "/security-images", handler: "security-image.find", config: { auth: false } },
    { method: "POST", path: "/security-images", handler: "security-image.create", config: { auth: false } },
    { method: "PUT", path: "/security-images/:id", handler: "security-image.update", config: { auth: false } },
    { method: "DELETE", path: "/security-images/:id", handler: "security-image.delete", config: { auth: false } },
  ],
};
