'use strict';

/**
 * Seed script: creates a sample stp-screen directly via Strapi document service.
 * No HTTP, no credentials needed.
 *
 * Usage:
 *   npm run seed:stp-screen          # dry-run (print payload)
 *   npm run seed:stp-screen -- --run # insert into DB
 */

const RUN = process.argv.includes('--run');

const SCREEN = {
  screenId: 'email-registration',
  version: 1,
  publishedAt: new Date().toISOString(),

  header: [
    {
      __component: 'navigation.top-navigation',
      componentId: 'topNav',
      span: '12',
      title: 'Global Access Account',
    },
    {
      __component: 'core.typo',
      componentId: 'pageSubtitle',
      span: '12',
      value: 'Global Access Account',
      type: 'subtitle1',
      textAlign: 'center',
    },
    {
      __component: 'core.typo',
      componentId: 'pageTitle',
      span: '12',
      value: 'Your Email Address',
      type: 'h2',
      textAlign: 'center',
    },
  ],

  body: [
    {
      __component: 'input.text-input',
      componentId: 'emailInput',
      span: '12',
      label: 'Email Address',
      placeholder: 'Enter your email address',
      required: true,
      type: 'email',
      minLength: 5,
      maxLength: 200,
      messages: {
        required: 'Email is required',
        email: 'Enter a valid email address',
        minLength: 'Email must be at least 5 characters',
      },
      dynamic: {
        enabled: true,
        type: 'VALUE',
        target: 'defaultValue',
        source: { type: 'FACT', path: 'userEmail' },
      },
    },
    {
      __component: 'input.text-input',
      componentId: 'confirmEmailInput',
      span: '12',
      label: 'Confirm Email Address',
      placeholder: 'Re-enter your email address',
      required: true,
      type: 'email',
      messages: {
        required: 'Please confirm your email',
        email: 'Enter a valid email address',
      },
    },
  ],

  footer: [
    {
      __component: 'action.button',
      componentId: 'nextButton',
      span: '12',
      label: 'Next',
      variant: 'primary',
      type: 'filled',
      size: 'lg',
    },
    {
      __component: 'container.divider',
      componentId: 'divider',
      span: '12',
      orientation: 'horizontal',
    },
    {
      __component: 'action.button',
      componentId: 'googleButton',
      span: '12',
      label: 'Continue with Google',
      variant: 'secondary',
      type: 'outlined',
      size: 'lg',
      iconName: 'google',
    },
    {
      __component: 'action.button',
      componentId: 'appleButton',
      span: '12',
      label: 'Continue with Apple',
      variant: 'secondary',
      type: 'outlined',
      size: 'lg',
      iconName: 'apple',
    },
  ],
};

if (!RUN) {
  console.log('=== DRY RUN — add --run to insert ===\n');
  console.log(JSON.stringify(SCREEN, null, 2));
  process.exit(0);
}

async function run() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const app = await createStrapi(await compileStrapi()).load();

  const doc = await app.documents('api::stp-screen.stp-screen').create({ data: SCREEN });

  console.log(`Created: documentId=${doc.documentId} screenId="${doc.screenId}" v${doc.version}`);

  await app.destroy();
}

run().catch((err) => { console.error(err); process.exit(1); });
