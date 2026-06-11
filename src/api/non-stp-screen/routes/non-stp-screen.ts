/**
 * non-stp-screen router
 */

export default {
  routes: [
    { method: "GET", path: "/non-stp-screens", handler: "non-stp-screen.find", config: { auth: false } },
    { method: "POST", path: "/non-stp-screens", handler: "non-stp-screen.create", config: { auth: false } },
    { method: "PUT", path: "/non-stp-screens/:id", handler: "non-stp-screen.update", config: { auth: false } },
    { method: "DELETE", path: "/non-stp-screens/:id", handler: "non-stp-screen.delete", config: { auth: false } },
    { method: "GET", path: "/non-stp-screens/:screenId", handler: "non-stp-screen.findByScreenId", config: { auth: false } },
  ],
};
