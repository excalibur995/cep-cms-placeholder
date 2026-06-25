/**
 * screen router
 */

export default {
  routes: [
    { method: "GET", path: "/screens", handler: "screen.find", config: { auth: false } },
    { method: "POST", path: "/screens", handler: "screen.create", config: { auth: false } },
    { method: "PUT", path: "/screens/:id", handler: "screen.update", config: { auth: false } },
    { method: "DELETE", path: "/screens/:id", handler: "screen.delete", config: { auth: false } },
    { method: "GET", path: "/screens/:journeyId", handler: "screen.findByScreenId", config: { auth: false } },
  ],
};
