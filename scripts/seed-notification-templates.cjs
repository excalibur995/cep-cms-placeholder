'use strict';

/**
 * Seed script: upserts Batch 1 Alerts & Transactions notification templates.
 * Source: docs/NGA_Common_PN Template ATLAS - Master PNS-2_Batch 1@v1.0.xlsx
 *         sheet "Alerts & Transactions" (114 rows with content)
 *
 * Usage:
 *   npm run seed:notifications          # dry-run (print payloads)
 *   npm run seed:notifications -- --run # upsert + publish into DB
 */

const RUN = process.argv.includes('--run');
const UID = 'api::notification-template.notification-template';
const TEMPLATES = require('./notification-templates.batch1.json');

if (!RUN) {
  console.log('=== DRY RUN — add --run to insert ===\n');
  console.log(`Total records: ${TEMPLATES.length}`);
  console.log(JSON.stringify(TEMPLATES[0], null, 2));
  process.exit(0);
}

async function upsert(app, data) {
  const existing = await app.documents(UID).findMany({
    filters: { templateId: { $eq: data.templateId } },
    limit: 1,
  });
  const entry = existing[0];
  let doc;
  if (entry) {
    doc = await app.documents(UID).update({ documentId: entry.documentId, data });
    process.stdout.write('u');
  } else {
    doc = await app.documents(UID).create({ data });
    process.stdout.write('c');
  }
  await app.documents(UID).publish({ documentId: doc.documentId });
  return { action: entry ? 'updated' : 'created', documentId: doc.documentId };
}

async function run() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const app = await createStrapi(await compileStrapi()).load();

  let created = 0, updated = 0;
  for (const tpl of TEMPLATES) {
    const { action } = await upsert(app, tpl);
    if (action === 'created') created++; else updated++;
  }

  console.log(`\nDone. created=${created} updated=${updated}`);
  await app.destroy();
}

run().catch((err) => { console.error(err); process.exit(1); });
