export default {
  routes: [
    { method: "GET",    path: "/notification-templates",           handler: "notification-template.find",   config: { auth: false } },
    { method: "POST",   path: "/notification-templates",           handler: "notification-template.create", config: { auth: false } },
    { method: "PUT",    path: "/notification-templates/:id",       handler: "notification-template.update", config: { auth: false } },
    { method: "DELETE", path: "/notification-templates/:id",       handler: "notification-template.delete", config: { auth: false } },
    { method: "GET",    path: "/notification-templates/:templateId", handler: "notification-template.findByTemplateId", config: { auth: false } },
  ],
};
