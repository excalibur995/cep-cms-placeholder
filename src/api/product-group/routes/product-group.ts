/**
 * product-group router
 */

export default {
  routes: [
    { method: "GET", path: "/product-groups/codes", handler: "product-group.findCodes", config: { auth: false } },
    { method: "GET", path: "/product-groups", handler: "product-group.find", config: { auth: false } },
    { method: "POST", path: "/product-groups", handler: "product-group.create", config: { auth: false } },
    { method: "PUT", path: "/product-groups/:id", handler: "product-group.update", config: { auth: false } },
    { method: "DELETE", path: "/product-groups/:id", handler: "product-group.delete", config: { auth: false } },
  ],
};
