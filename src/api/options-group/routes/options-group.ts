export default {
  routes: [
    { method: "GET", path: "/options", handler: "options-group.find", config: { auth: false } },
    { method: "GET", path: "/options/:slug", handler: "options-group.findBySlug", config: { auth: false } },
  ],
};
