/**
 * media-asset router
 */

export default {
  routes: [
    { method: "GET", path: "/media-assets", handler: "media-asset.find", config: { auth: false } },
    { method: "POST", path: "/media-assets", handler: "media-asset.create", config: { auth: false } },
    { method: "PUT", path: "/media-assets/:id", handler: "media-asset.update", config: { auth: false } },
    { method: "DELETE", path: "/media-assets/:id", handler: "media-asset.delete", config: { auth: false } },
    { method: "GET", path: "/media-assets/:mediaId", handler: "media-asset.findByMediaId", config: { auth: false } },
  ],
};
