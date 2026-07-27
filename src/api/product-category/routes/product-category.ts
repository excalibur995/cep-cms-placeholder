/**
 * product-category router
 */

export default {
  routes: [
    { method: "GET", path: "/product-categories/codes", handler: "product-category.findCodes", config: { auth: false } },
    { method: "GET", path: "/product-categories", handler: "product-category.find", config: { auth: false } },
    { method: "POST", path: "/product-categories", handler: "product-category.create", config: { auth: false } },
    { method: "PUT", path: "/product-categories/:id", handler: "product-category.update", config: { auth: false } },
    { method: "DELETE", path: "/product-categories/:id", handler: "product-category.delete", config: { auth: false } },
  ],
};
