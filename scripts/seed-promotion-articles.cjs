'use strict';

/**
 * Seed script: creates 3 sample Promotion Articles (+ their tags) for FSD 5.0
 * Promotions, covering the range of bodyContent (blocks) shapes seen in the FSD
 * mockup: plain paragraphs, inline bold, headings, and lists.
 *
 * Usage:
 *   npm run seed:promotions          # dry-run (print payload)
 *   npm run seed:promotions -- --run # upsert into DB
 */

const RUN = process.argv.includes('--run');

const ARTICLE_UID = 'api::promotion-article.promotion-article';
const TAG_UID = 'api::promotion-tag.promotion-tag';

const now = new Date();
const daysFromNow = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000).toISOString();

const TAGS = [
  { tagCode: 'cashback', tagName: 'Cashback' },
  { tagCode: 'dining', tagName: 'Dining' },
  { tagCode: 'savings', tagName: 'Savings' },
];

// Strapi Blocks JSON — see @strapi/blocks-react-renderer node shapes:
// paragraph / heading(level) / list(format: 'ordered'|'unordered' -> list-item) / text(bold)
const paragraph = (text) => ({ type: 'paragraph', children: [{ type: 'text', text }] });
const heading = (text, level = 3) => ({ type: 'heading', level, children: [{ type: 'text', text }] });
const list = (items, format = 'unordered') => ({
  type: 'list',
  format,
  children: items.map((text) => ({ type: 'list-item', children: [{ type: 'text', text }] })),
});

const ARTICLES = [
  {
    // Matches the FSD 5.0 mockup screenshot ("Far East Hospitality OASIA") structure:
    // intro paragraph -> validity line -> T&C heading+paragraph -> Location heading+list.
    promotionArticleId: 'promo-seed-oasia',
    title: 'Far East Hospitality OASIA',
    shortDescription: 'Enjoy 25% off with Maybank Credit Card.',
    bodyContent: [
      paragraph(
        "After a full day exploring the many attractions of Singapore or Malaysia, it's time to unwind in a place that offers true comfort and tranquility. Book your stay at OASIA Hotels and enjoy 25% off with Maybank Credit Card.",
      ),
      paragraph('Valid until 23 Mar 2026'),
      heading('Terms & Conditions'),
      paragraph(
        '25% off applies to bookings made through the website and enter the promo code Maybank during the transactions. This promo is non-refundable and cannot be combined with other promotions, offers, loyalty cards, or coupons. Subject to the terms and conditions of Maybank and OASIA Hotels. Valid for Maybank Mastercard® and Visa Credit Card.',
      ),
      heading('Location/contact'),
      list([
        'OASIA Hotel Downtown — 100 Peck Seah Street, Singapore 079333. Tel: +65 6812 6900',
        'OASIA Hotel Novena — 8 Sinaran Drive, Singapore 307470. Tel: +65 6664 0333',
        'OASIA Resort Sentosa — 23 Beach View, Palawan Ridge, #01-01, Sentosa Island, Singapore 098679. Tel: +65 6818 3388',
        'OASIA Suites Kuala Lumpur — No.10, Lorong P Ramlee 50250, Kuala Lumpur, Malaysia. Tel: +603 272 66788',
      ]),
    ],
    image: 'oasia-hero.jpg',
    tags: ['cashback'],
    countries: ['SG', 'MY'],
    recommended: true,
    publishedDate: daysFromNow(-5),
    startDate: daysFromNow(-1),
    endDate: daysFromNow(60),
    learnMoreType: 'in-app',
    learnMoreLink: '/promotions/oasia',
  },
  {
    // Simple case — plain paragraphs only, no headings/lists, to show blocks
    // degrades cleanly to "just text" when the content doesn't need structure.
    promotionArticleId: 'promo-seed-firefly',
    title: 'Firefly Flight Deals',
    shortDescription: 'Get up to 18% discount with Maybank TREATS Points.',
    bodyContent: [
      paragraph(
        'Book your flight tickets and get up to 18% discount with Maybank TREATS Points. Fly with Firefly to your favourite destinations across Southeast Asia.',
      ),
      paragraph('Valid until 30 Sep 2026'),
      paragraph(
        'Discount applies to base fare only. Taxes and surcharges are not included. Subject to seat availability.',
      ),
    ],
    image: 'firefly-hero.jpg',
    tags: ['cashback'],
    countries: ['ID'],
    recommended: false,
    publishedDate: daysFromNow(-1),
    startDate: daysFromNow(-1),
    endDate: daysFromNow(45),
    learnMoreType: 'web-viewer',
    learnMoreLink: 'https://example.com/promotions/firefly',
  },
  {
    // Medium case — inline bold within a paragraph + a heading + a short list.
    promotionArticleId: 'promo-seed-takumi',
    title: 'Takumi Dining Offer',
    shortDescription: 'Enjoy 15% savings when dining with your Maybank Visa Card.',
    bodyContent: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Enjoy ' },
          { type: 'text', text: '15% savings', bold: true },
          { type: 'text', text: ' when dining with your Maybank Visa Credit Card at any Takumi outlet.' },
        ],
      },
      heading('Terms & Conditions'),
      list([
        'Discount applies to food and beverage only.',
        'Not valid with other ongoing promotions.',
        'Valid at participating outlets in Indonesia and Cambodia only.',
      ]),
    ],
    image: 'takumi-hero.jpg',
    tags: ['dining', 'savings'],
    countries: ['ID', 'KH'],
    recommended: false,
    publishedDate: daysFromNow(-10),
    startDate: daysFromNow(-1),
    endDate: daysFromNow(20),
    learnMoreType: 'in-app',
    learnMoreLink: '/promotions/takumi',
  },
];

if (!RUN) {
  console.log('=== DRY RUN — add --run to insert ===\n');
  console.log(`Tags: ${TAGS.length}, Articles: ${ARTICLES.length}\n`);
  console.log(JSON.stringify(ARTICLES[0], null, 2));
  process.exit(0);
}

async function upsertTag(app, data) {
  const existing = await app.documents(TAG_UID).findMany({
    filters: { tagCode: { $eq: data.tagCode } },
    limit: 1,
  });
  const entry = existing[0];
  const doc = entry
    ? await app.documents(TAG_UID).update({ documentId: entry.documentId, data })
    : await app.documents(TAG_UID).create({ data });
  // promotion-tag has draftAndPublish disabled — entries are live on write, no publish() call.
  return doc;
}

async function upsertArticle(app, data, tagDocumentIds) {
  const { tags, ...rest } = data;
  const payload = { ...rest, tags: tagDocumentIds };

  const existing = await app.documents(ARTICLE_UID).findMany({
    filters: { promotionArticleId: { $eq: data.promotionArticleId } },
    limit: 1,
  });
  const entry = existing[0];
  const doc = entry
    ? await app.documents(ARTICLE_UID).update({ documentId: entry.documentId, data: payload })
    : await app.documents(ARTICLE_UID).create({ data: payload });
  await app.documents(ARTICLE_UID).publish({ documentId: doc.documentId });
  console.log(
    `${entry ? 'Updated' : 'Created'} promotion-article: documentId=${doc.documentId} promotionArticleId="${doc.promotionArticleId}"`,
  );
  return doc;
}

async function run() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const app = await createStrapi(await compileStrapi()).load();

  const tagDocumentIdByCode = {};
  for (const tag of TAGS) {
    const doc = await upsertTag(app, tag);
    tagDocumentIdByCode[tag.tagCode] = doc.documentId;
    console.log(`Upserted promotion-tag: documentId=${doc.documentId} tagCode="${doc.tagCode}"`);
  }

  for (const article of ARTICLES) {
    const tagDocumentIds = article.tags.map((code) => tagDocumentIdByCode[code]);
    await upsertArticle(app, article, tagDocumentIds);
  }

  await app.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
