export default {
  routes: [
    {
      method: "GET",
      path: "/navigators",
      handler: "navigator.find",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/navigators/:subJourneyId",
      handler: "navigator.findBySubJourney",
      config: { auth: false },
    },
  ],
};
