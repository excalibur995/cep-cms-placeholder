export default {
  routes: [
    {
      method: "GET",
      path: "/navigator/:subJourneyId",
      handler: "navigator.findBySubJourney",
      config: { auth: false },
    },
  ],
};
