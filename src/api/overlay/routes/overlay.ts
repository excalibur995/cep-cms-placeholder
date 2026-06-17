/**
 * overlay router
 */

export default {
  routes: [
    { method: "GET",    path: "/overlays",     handler: "overlay.find",   config: { auth: false } },
    { method: "POST",   path: "/overlays",     handler: "overlay.create", config: { auth: false } },
    { method: "PUT",    path: "/overlays/:id", handler: "overlay.update", config: { auth: false } },
    { method: "DELETE", path: "/overlays/:id", handler: "overlay.delete", config: { auth: false } },
  ],
};
