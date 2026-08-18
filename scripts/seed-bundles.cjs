'use strict';

/**
 * Seed script: uploads every file under
 * docs/eng-playground/data/bundles/<module>/<platform>/<version>/ into the Strapi Media
 * Library (mirroring the source folder structure as Media Library folders, for
 * management/visibility in the admin), then publishes the `ios-manifest` and
 * `android-manifest` single types straight from docs/eng-playground/data/manifests/
 * ios.json + android.json.
 *
 * Note: `entry` in those manifest files already points at Strapi (see
 * public/bundles -> docs/eng-playground/data/bundles symlink, served statically by
 * Strapi at the same readable path the files have on disk), so this script copies them
 * through as-is rather than rewriting them to the Media Library's hashed upload URLs.
 *
 * Idempotent: re-running skips files/folders that already exist and updates (rather than
 * duplicates) the two single type entries.
 *
 * Usage:
 *   node scripts/seed-bundles.cjs
 */

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const BUNDLES_ROOT = path.join(__dirname, '..', 'docs', 'eng-playground', 'data', 'bundles');
const MANIFESTS_DIR = path.join(__dirname, '..', 'docs', 'eng-playground', 'data', 'manifests');
const IOS_UID = 'api::ios-manifest.ios-manifest';
const ANDROID_UID = 'api::android-manifest.android-manifest';
const FOLDER_UID = 'plugin::upload.folder';
const FILE_UID = 'plugin::upload.file';

const IGNORED_FILES = new Set(['.DS_Store', '.gitkeep']);

function listDirs(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function listFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && !IGNORED_FILES.has(d.name))
    .map((d) => d.name)
    .sort();
}

async function getOrCreateFolder(strapi, name, parentId) {
  const folderService = strapi.plugin('upload').service('folder');
  const existing = await strapi.db.query(FOLDER_UID).findOne({ where: { name, parent: parentId ?? null } });
  if (existing) return existing;
  return folderService.create({ name, parent: parentId ?? null });
}

async function ensureFolderPath(strapi, segments) {
  let parentId = null;
  let folder = null;
  for (const segment of segments) {
    folder = await getOrCreateFolder(strapi, segment, parentId);
    parentId = folder.id;
  }
  return folder;
}

async function uploadFile(strapi, folderId, filePath, fileName) {
  const uploadService = strapi.plugin('upload').service('upload');

  const existing = await strapi.db.query(FILE_UID).findOne({ where: { name: fileName, folder: folderId } });
  if (existing) return existing;

  const stat = fs.statSync(filePath);
  const fileObject = {
    filepath: filePath,
    originalFilename: fileName,
    mimetype: mime.lookup(fileName) || 'application/octet-stream',
    size: stat.size,
  };

  const [uploaded] = await uploadService.upload({
    data: { fileInfo: { folder: folderId } },
    files: fileObject,
  });

  return uploaded;
}

async function seedBundles(strapi) {
  const modules = listDirs(BUNDLES_ROOT);

  for (const moduleName of modules) {
    const moduleDir = path.join(BUNDLES_ROOT, moduleName);
    const platforms = listDirs(moduleDir);

    for (const platform of platforms) {
      const platformDir = path.join(moduleDir, platform);
      const versions = listDirs(platformDir);

      for (const version of versions) {
        const versionDir = path.join(platformDir, version);
        const files = listFiles(versionDir);
        const folder = await ensureFolderPath(strapi, ['bundles', moduleName, platform, version]);

        console.log(`\n[${moduleName}/${platform}/${version}] uploading ${files.length} files...`);
        let count = 0;
        for (const fileName of files) {
          await uploadFile(strapi, folder.id, path.join(versionDir, fileName), fileName);
          count += 1;
          if (count % 25 === 0 || count === files.length) {
            console.log(`  [${moduleName}/${platform}/${version}] ${count}/${files.length}`);
          }
        }
      }
    }
  }
}

function readManifest(fileName) {
  const filePath = path.join(MANIFESTS_DIR, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function upsertSingleType(strapi, uid, manifest) {
  const existing = await strapi.documents(uid).findFirst({});
  let doc;
  if (existing) {
    doc = await strapi.documents(uid).update({ documentId: existing.documentId, data: { manifest } });
  } else {
    doc = await strapi.documents(uid).create({ data: { manifest } });
  }
  await strapi.documents(uid).publish({ documentId: doc.documentId });
  return doc;
}

async function run() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const app = await createStrapi(await compileStrapi()).load();

  try {
    await seedBundles(app);

    const iosManifest = readManifest('ios.json');
    const androidManifest = readManifest('android.json');

    const iosDoc = await upsertSingleType(app, IOS_UID, iosManifest);
    console.log(`\nUpserted ios-manifest: documentId=${iosDoc.documentId}`);
    console.log(JSON.stringify(iosManifest, null, 2));

    const androidDoc = await upsertSingleType(app, ANDROID_UID, androidManifest);
    console.log(`\nUpserted android-manifest: documentId=${androidDoc.documentId}`);
    console.log(JSON.stringify(androidManifest, null, 2));
  } finally {
    await app.destroy();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
