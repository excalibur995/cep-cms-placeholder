'use strict';

/**
 * Fix script: rewrites the `entry` URL in each module of the published
 * `android-manifest` / `ios-manifest` single types so it points at the real
 * Media Library file (e.g. /uploads/mf_manifest_<hash>.json) instead of the
 * old /bundles/<module>/<platform>/<version>/mf-manifest.json path, which
 * only ever worked via the public/bundles -> docs/eng-playground/data/bundles
 * symlink (a directory that does not exist on this machine).
 *
 * Reads the current manifest JSON (for module/platform/version), looks up
 * the corresponding "mf-manifest.json" file already uploaded by
 * scripts/seed-bundles.cjs under Media Library folder bundles/<module>/<platform>/<version>,
 * and rewrites `entry` to that file's real URL.
 *
 * Idempotent: safe to re-run.
 *
 * Usage:
 *   node scripts/fix-manifest-entries.cjs
 */

const IOS_UID = 'api::ios-manifest.ios-manifest';
const ANDROID_UID = 'api::android-manifest.android-manifest';
const FOLDER_UID = 'plugin::upload.folder';
const FILE_UID = 'plugin::upload.file';

function absoluteUrl(strapi, url) {
  if (/^https?:\/\//.test(url)) return url;
  const serverUrl = strapi.config.get('server.url', '') || '';
  const base = serverUrl || `http://localhost:${strapi.config.get('server.port', 1337)}`;
  return `${base}${url}`;
}

async function findFolder(strapi, name, parentId) {
  return strapi.db.query(FOLDER_UID).findOne({ where: { name, parent: parentId ?? null } });
}

async function findManifestFileUrl(strapi, moduleName, platform, version) {
  const bundlesFolder = await findFolder(strapi, 'bundles', null);
  if (!bundlesFolder) return null;
  const moduleFolder = await findFolder(strapi, moduleName, bundlesFolder.id);
  if (!moduleFolder) return null;
  const platformFolder = await findFolder(strapi, platform, moduleFolder.id);
  if (!platformFolder) return null;
  const versionFolder = await findFolder(strapi, version, platformFolder.id);
  if (!versionFolder) return null;

  const file = await strapi.db
    .query(FILE_UID)
    .findOne({ where: { name: 'mf-manifest.json', folder: versionFolder.id } });
  return file ? absoluteUrl(strapi, file.url) : null;
}

async function fixManifest(strapi, uid, platform) {
  const doc = await strapi.documents(uid).findFirst({});
  if (!doc) {
    console.log(`[${uid}] no entry found, skipping`);
    return;
  }

  const manifest = doc.manifest || {};
  let changed = false;

  for (const [moduleName, mod] of Object.entries(manifest)) {
    const url = await findManifestFileUrl(strapi, moduleName, platform, mod.version);
    if (!url) {
      console.warn(`[${uid}] no uploaded mf-manifest.json found for ${moduleName}/${platform}/${mod.version}, leaving as-is`);
      continue;
    }
    if (mod.entry !== url) {
      console.log(`[${uid}] ${moduleName}: ${mod.entry} -> ${url}`);
      mod.entry = url;
      changed = true;
    }
  }

  if (!changed) {
    console.log(`[${uid}] already up to date`);
    return;
  }

  await strapi.documents(uid).update({ documentId: doc.documentId, data: { manifest } });
  await strapi.documents(uid).publish({ documentId: doc.documentId });
  console.log(`[${uid}] updated + published`);
}

async function run() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const app = await createStrapi(await compileStrapi()).load();

  try {
    await fixManifest(app, ANDROID_UID, 'android');
    await fixManifest(app, IOS_UID, 'ios');
  } finally {
    await app.destroy();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
