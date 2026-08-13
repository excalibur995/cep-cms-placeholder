/**
 * promotion-article controller
 *
 * Custom filter/sort for the Promotions List screen (FSD 5.0). Design notes:
 * docs/PROMOTIONS_FILTER_SORT_SPEC.md
 *
 * GET /promotion-articles
 *   Always active-window filtered (startDate<=now<=endDate) + published, regardless of
 *   what the client asks for. Supports:
 *     ?country=All|ID|MY|SG|PH|KH  (default All; filters `countries` array-contains)
 *     ?tags=codeA,codeB            (relation filter, $in on tagCode)
 *     ?search=text                 (title $containsi, min 2 chars — shorter is ignored)
 *     ?sort=recommended|ending-soon|newest  (default recommended)
 *     ?page=&pageSize=             (default 1 / 10)
 * GET /promotion-articles/tags
 *   Distinct tags in use on active, published articles only (not the full tag table —
 *   that's GET /promotion-tags). Powers the Category filter pills.
 * GET /promotion-articles/countries
 *   Static 5-country list in FSD order. No DB query.
 * GET /promotion-articles/:promotionArticleId
 *   Single article lookup.
 */

import { factories } from "@strapi/strapi";

const UID = "api::promotion-article.promotion-article";

type PromotionTag = { tagCode?: string; tagName?: string };

type PromotionArticle = {
  promotionArticleId?: string;
  title?: string;
  countries?: string[];
  recommended?: boolean;
  publishedDate?: string;
  startDate?: string;
  endDate?: string;
  tags?: PromotionTag[];
};

type SortMode = "recommended" | "ending-soon" | "newest";

const COUNTRY_PRIORITY = ["ID", "MY", "SG", "PH", "KH"];

const PROMOTION_COUNTRIES = [
  { code: "ID", name: "Indonesia" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "PH", name: "Philippines" },
  { code: "KH", name: "Cambodia" },
];

const countryPriorityIndex = (code?: string) => {
  const i = COUNTRY_PRIORITY.indexOf(code ?? "");
  return i === -1 ? COUNTRY_PRIORITY.length : i;
};

const timeOf = (value?: string) => (value ? new Date(value).getTime() : 0);

const byTitle = (a: PromotionArticle, b: PromotionArticle) =>
  (a.title ?? "").localeCompare(b.title ?? "");

/** Mode-specific tiebreak, shared by both the ALL-tab and single-country-tab paths. */
const byModeTiebreak = (mode: SortMode) => (a: PromotionArticle, b: PromotionArticle) =>
  mode === "ending-soon"
    ? timeOf(a.endDate) - timeOf(b.endDate) // soonest-expiring first
    : timeOf(b.publishedDate) - timeOf(a.publishedDate); // newest first

/**
 * Business Rule #10 (FSD 5.0): country-count tiering only applies on the ALL tab (5→1
 * applicable countries, 1-country ties broken by fixed ID>MY>SG>PH>KH priority). A single
 * country tab skips tiering entirely — it's just mode-tiebreak then alpha.
 */
const makeComparator = (mode: SortMode, isAllTab: boolean) => {
  const modeTiebreak = byModeTiebreak(mode);

  return (a: PromotionArticle, b: PromotionArticle) => {
    if (mode === "recommended") {
      const rec = (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0);
      if (rec !== 0) return rec;
    }

    if (isAllTab) {
      const countA = a.countries?.length ?? 0;
      const countB = b.countries?.length ?? 0;
      const countDiff = countB - countA;
      if (countDiff !== 0) return countDiff;

      if (countA === 1 && countB === 1) {
        const priorityDiff =
          countryPriorityIndex(a.countries?.[0]) - countryPriorityIndex(b.countries?.[0]);
        if (priorityDiff !== 0) return priorityDiff;
      }
    }

    const tiebreak = modeTiebreak(a, b);
    if (tiebreak !== 0) return tiebreak;

    return byTitle(a, b);
  };
};

export default factories.createCoreController(UID, ({ strapi }) => ({
  async findPromotions(ctx) {
    const { country, tags, search, sort, page, pageSize, locale } = (ctx.query ?? {}) as {
      country?: string;
      tags?: string;
      search?: string;
      sort?: SortMode;
      page?: string;
      pageSize?: string;
      locale?: string;
    };

    const now = new Date().toISOString();
    const filters: Record<string, unknown> = {
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (search && search.trim().length >= 2) {
      filters.title = { $containsi: search.trim() };
    }

    const tagCodes = (tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    if (tagCodes.length > 0) {
      filters.tags = { tagCode: { $in: tagCodes } };
    }

    const results = (await strapi.documents(UID).findMany({
      filters,
      status: "published",
      populate: ["tags"],
      ...(locale ? { locale } : {}),
    })) as unknown as PromotionArticle[];

    const isAllTab = !country || country === "All";
    const scoped = isAllTab
      ? results
      : results.filter((article) => article.countries?.includes(country as string));

    const mode: SortMode = sort ?? "recommended";
    const sorted = [...scoped].sort(makeComparator(mode, isAllTab));

    const pageNum = Math.max(Number(page) || 1, 1);
    const size = Math.max(Number(pageSize) || 10, 1);
    const start = (pageNum - 1) * size;
    const paged = sorted.slice(start, start + size);

    return {
      data: paged,
      meta: {
        pagination: {
          page: pageNum,
          pageSize: size,
          total: sorted.length,
          pageCount: Math.ceil(sorted.length / size) || 0,
        },
      },
    };
  },

  /** GET /promotion-articles/:promotionArticleId -> single article, tags populated. */
  async findByPromotionArticleId(ctx) {
    const { promotionArticleId } = ctx.params as { promotionArticleId: string };
    const { locale } = (ctx.query ?? {}) as { locale?: string };

    const results = await strapi.documents(UID).findMany({
      filters: { promotionArticleId: { $eq: promotionArticleId } },
      populate: ["tags"],
      status: "published",
      limit: 1,
      ...(locale ? { locale } : {}),
    });

    const entity = results[0];
    if (!entity) return ctx.notFound();
    return entity;
  },

  /** GET /promotion-articles/tags -> distinct tags in use on active, published articles. */
  async findActiveTags(ctx) {
    const { locale } = (ctx.query ?? {}) as { locale?: string };
    const now = new Date().toISOString();

    const results = (await strapi.documents(UID).findMany({
      filters: { startDate: { $lte: now }, endDate: { $gte: now } },
      status: "published",
      populate: ["tags"],
      ...(locale ? { locale } : {}),
    })) as unknown as PromotionArticle[];

    const seen = new Map<string, PromotionTag>();
    for (const article of results) {
      for (const tag of article.tags ?? []) {
        if (tag?.tagCode && !seen.has(tag.tagCode)) {
          seen.set(tag.tagCode, { tagCode: tag.tagCode, tagName: tag.tagName });
        }
      }
    }

    return [...seen.values()].sort((a, b) => (a.tagName ?? "").localeCompare(b.tagName ?? ""));
  },

  /** GET /promotion-articles/countries -> static 5-country list, FSD order, no DB. */
  async listCountries() {
    return PROMOTION_COUNTRIES;
  },

  /**
   * create/update call the Document Service directly instead of the stock factory
   * actions. Reason: every route in this repo is `auth:false`, and under
   * `route.config.auth === false` Strapi's authenticate() middleware skips setting
   * `ctx.state.auth` entirely (see @strapi/core/services/auth) — so the stock actions'
   * content-API sanitizer, which validates relation fields (here: `tags`) against the
   * *request's* auth context, always rejects them ("Invalid key tags") regardless of
   * what Public-role permissions exist. Bypassing the sanitizer matches the trust model
   * already in place everywhere else in this repo — nothing is actually access-controlled
   * today since every route is public.
   */
  async create(ctx) {
    const { data } = ctx.request.body as { data: Record<string, unknown> };
    const entity = await strapi
      .documents(UID)
      .create({ data: data as never, status: "published", populate: ["tags"] });
    return { data: entity };
  },

  async update(ctx) {
    const { id } = ctx.params as { id: string };
    const { data } = ctx.request.body as { data: Record<string, unknown> };
    const entity = await strapi
      .documents(UID)
      .update({ documentId: id, data: data as never, status: "published", populate: ["tags"] });
    return { data: entity };
  },
}));
