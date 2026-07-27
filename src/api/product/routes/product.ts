/**
 * product router
 */

export default {
  routes: [
    { method: "GET", path: "/aggregated-products", handler: "product.findAggregated", config: { auth: false } },
    { method: "GET", path: "/products/:productId", handler: "product.findByProductId", config: { auth: false } },
    { method: "POST", path: "/products", handler: "product.create", config: { auth: false } },
    { method: "PUT", path: "/products/:id", handler: "product.update", config: { auth: false } },
    { method: "DELETE", path: "/products/:id", handler: "product.delete", config: { auth: false } },
  ],
};
