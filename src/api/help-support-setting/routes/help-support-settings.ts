export default {
  routes: [
    {
      method: "GET",
      path: "/help-support-settings",
      handler: "help-support-settings.find",
      config: { auth: false },
    },
  ],
};
