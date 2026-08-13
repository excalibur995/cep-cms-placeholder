/**
 * promotion-tag router
 */

export default {
  routes: [
    { method: "GET", path: "/promotion-tags", handler: "promotion-tag.find", config: { auth: false } },
    { method: "GET", path: "/promotion-tags/:id", handler: "promotion-tag.findOne", config: { auth: false } },
    { method: "POST", path: "/promotion-tags", handler: "promotion-tag.create", config: { auth: false } },
    { method: "PUT", path: "/promotion-tags/:id", handler: "promotion-tag.update", config: { auth: false } },
    { method: "DELETE", path: "/promotion-tags/:id", handler: "promotion-tag.delete", config: { auth: false } },
  ],
};
