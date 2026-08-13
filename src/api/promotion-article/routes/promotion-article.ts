/**
 * promotion-article router
 */

export default {
  routes: [
    { method: "GET", path: "/promotion-articles/tags", handler: "promotion-article.findActiveTags", config: { auth: false } },
    { method: "GET", path: "/promotion-articles/countries", handler: "promotion-article.listCountries", config: { auth: false } },
    { method: "GET", path: "/promotion-articles", handler: "promotion-article.findPromotions", config: { auth: false } },
    { method: "GET", path: "/promotion-articles/:promotionArticleId", handler: "promotion-article.findByPromotionArticleId", config: { auth: false } },
    { method: "POST", path: "/promotion-articles", handler: "promotion-article.create", config: { auth: false } },
    { method: "PUT", path: "/promotion-articles/:id", handler: "promotion-article.update", config: { auth: false } },
    { method: "DELETE", path: "/promotion-articles/:id", handler: "promotion-article.delete", config: { auth: false } },
  ],
};
