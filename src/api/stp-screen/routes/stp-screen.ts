export default {
  routes: [
    { method: "GET", path: "/stp-screens", handler: "stp-screen.find", config: { auth: false } },
    { method: "POST", path: "/stp-screens", handler: "stp-screen.create", config: { auth: false } },
    { method: "PUT", path: "/stp-screens/:id", handler: "stp-screen.update", config: { auth: false } },
    { method: "DELETE", path: "/stp-screens/:id", handler: "stp-screen.delete", config: { auth: false } },
    { method: "GET", path: "/stp-screens/:screenId", handler: "stp-screen.findByScreenId", config: { auth: false } },
  ],
};
