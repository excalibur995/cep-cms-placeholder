'use strict';

/**
 * Seed script: creates navigator entries for the Credit Card application journey.
 *
 * Usage:
 *   npm run seed:navigator          # dry-run (print payload)
 *   npm run seed:navigator -- --run # upsert into DB
 */

const RUN = process.argv.includes('--run');

const NAVIGATOR_APPLY_CC = {
  subJourneyId: 'APPLY_CC',
  screens: [
    { screenCode: 'SCR_CC_EKTP',                screenName: 'EktpInstruction',        sequence: 1 },
    { screenCode: 'SCR_CC_OWNERSHIP',           screenName: 'CcOwnership',            sequence: 2 },
    { screenCode: 'SCR_CC_EMERGENCY_CONTACT',   screenName: 'EmergencyContactDetails', sequence: 3 },
    { screenCode: 'SCR_CC_CORRESPONDENCE_ADDR', screenName: 'CorrespondenceAddress',  sequence: 4 },
    { screenCode: 'SCR_CC_SPENDING_LIMIT',      screenName: 'SpendingLimit',          sequence: 5 },
    { screenCode: 'SCR_CC_AUTO_DEBIT',          screenName: 'AutoDebitSetup',         sequence: 6 },
    { screenCode: 'SCR_CC_TNC',                 screenName: 'TermsAndConditions',     sequence: 7 },
    { screenCode: 'SCR_CC_CONFIRMATION',        screenName: 'Confirmation',           sequence: 8 },
    { screenCode: 'SCR_CC_FINAL_SCREEN',        screenName: 'FinalScreen',            sequence: 9 },
  ],
};

if (!RUN) {
  console.log('=== DRY RUN — add --run to insert ===\n');
  console.log(JSON.stringify(NAVIGATOR_APPLY_CC, null, 2));
  process.exit(0);
}

async function upsertNavigator(app, data) {
  const existing = await app.documents('api::navigator.navigator').findMany({
    filters: { subJourneyId: { $eq: data.subJourneyId } },
    limit: 1,
  });
  const entry = existing[0];
  let doc;
  if (entry) {
    doc = await app.documents('api::navigator.navigator').update({
      documentId: entry.documentId,
      data,
    });
    console.log(`Updated navigator: documentId=${doc.documentId} subJourneyId="${doc.subJourneyId}"`);
  } else {
    doc = await app.documents('api::navigator.navigator').create({ data });
    console.log(`Created navigator: documentId=${doc.documentId} subJourneyId="${doc.subJourneyId}"`);
  }
  await app.documents('api::navigator.navigator').publish({ documentId: doc.documentId });
  return doc;
}

async function run() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const app = await createStrapi(await compileStrapi()).load();

  await upsertNavigator(app, NAVIGATOR_APPLY_CC);

  await app.destroy();
}

run().catch((err) => { console.error(err); process.exit(1); });
