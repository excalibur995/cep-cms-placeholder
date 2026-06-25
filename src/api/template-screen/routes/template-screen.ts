export default {
  routes: [
    { method: "GET", path: "/template-screens", handler: "template-screen.find", config: { auth: false } },
    { method: "GET", path: "/template-screens/:screenId", handler: "template-screen.findByScreenId", config: { auth: false } },
  ],
};
