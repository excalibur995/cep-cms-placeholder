export default {
  routes: [
    {
      method: "POST",
      path: "/i18n-content-upload",
      handler: "i18n-content-upload.upload",
      config: {
        auth: {},
      },
    },
  ],
};
