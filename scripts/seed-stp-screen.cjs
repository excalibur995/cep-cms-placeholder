'use strict';

/**
 * Seed script: creates a sample stp-screen directly via Strapi document service.
 * No HTTP, no credentials needed.
 *
 * Usage:
 *   npm run seed:stp-screen          # dry-run (print payload)
 *   npm run seed:stp-screen -- --run # insert into DB
 *
 * Covers every authoring feature:
 *   - All 10 input component types
 *   - All 4 rule effects: SHOW, HIDE, ENABLE, DISABLE
 *   - Condition schema forms: { const: string }, { const: boolean }, { enum: [...] }
 *   - choices (dropdown, radio-button, checkbox)
 *   - dependsOn
 *   - dynamic source
 *   - messages validation
 *   - HorizontalLayout via span-6 pair
 */

const RUN = process.argv.includes('--run');

const SCREEN = {
  screenId: 'complete-form-example',
  version: 1,
  publishedAt: new Date().toISOString(),

  header: [
    {
      __component: 'navigation.top-navigation',
      componentId: 'topNav',
      span: '12',
      title: 'Complete Form Example',
    },
    {
      __component: 'core.typo',
      componentId: 'screenTitle',
      span: '12',
      value: 'All Conditions Demo',
      type: 'h2',
      textAlign: 'center',
    },
    {
      __component: 'core.typo',
      componentId: 'screenSubtitle',
      span: '12',
      value: 'Fill in all fields below',
      type: 'body1',
      textAlign: 'center',
    },
  ],

  body: [
    // ── HorizontalLayout: span-6 pair ────────────────────────────────────────
    {
      __component: 'input.text-input',
      componentId: 'firstName',
      span: '6',
      label: 'First Name',
      placeholder: 'Enter first name',
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
      messages: {
        required: 'First name is required',
        minLength: 'Minimum 2 characters',
      },
    },
    {
      __component: 'input.text-input',
      componentId: 'lastName',
      span: '6',
      label: 'Last Name',
      placeholder: 'Enter last name',
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
      messages: {
        required: 'Last name is required',
      },
    },

    // ── text-input — dynamic source (pre-fills from a fact) ──────────────────
    {
      __component: 'input.text-input',
      componentId: 'emailAddress',
      span: '12',
      label: 'Email Address',
      placeholder: 'Enter your email',
      required: true,
      type: 'string',
      minLength: 5,
      maxLength: 200,
      messages: {
        required: 'Email is required',
        email: 'Enter a valid email address',
        minLength: 'Email must be at least 5 characters',
        maxLength: 'Email must be at most 200 characters',
      },
      dynamic: {
        enabled: true,
        type: 'VALUE',
        target: 'defaultValue',
        source: { type: 'FACT', path: 'userEmail' },
      },
    },

    // ── dropdown with choices ────────────────────────────────────────────────
    {
      __component: 'input.dropdown',
      componentId: 'country',
      span: '12',
      label: 'Country',
      placeholder: 'Select your country',
      required: true,
      type: 'string',
      choices: [
        { value: 'MY', label: 'Malaysia' },
        { value: 'SG', label: 'Singapore' },
        { value: 'TH', label: 'Thailand' },
        { value: 'ID', label: 'Indonesia' },
      ],
      messages: {
        required: 'Please select a country',
      },
    },

    // ── radio-button with choices ────────────────────────────────────────────
    {
      __component: 'input.radio-button',
      componentId: 'contactMethod',
      span: '12',
      label: 'Preferred Contact Method',
      required: true,
      type: 'string',
      groupDirection: 'vertical',
      choices: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone Call' },
        { value: 'sms', label: 'SMS' },
      ],
      messages: {
        required: 'Please select a contact method',
      },
    },

    // ── text-input — rule: SHOW when contactMethod == "phone" (const string) ─
    {
      __component: 'input.text-input',
      componentId: 'phoneNumber',
      span: '12',
      label: 'Phone Number',
      placeholder: '+60 12 345 6789',
      type: 'string',
      dependsOn: [{ componentId: 'contactMethod' }],
      rule: {
        effect: 'SHOW',
        condition: {
          scope: 'contactMethod',
          schema: { const: 'phone' },
        },
      },
    },

    // ── text-input — rule: HIDE when country == "MY" (const string) ──────────
    {
      __component: 'input.text-input',
      componentId: 'foreignId',
      span: '12',
      label: 'Foreign ID Number',
      placeholder: 'Enter foreign identification number',
      type: 'string',
      rule: {
        effect: 'HIDE',
        condition: {
          scope: 'country',
          schema: { const: 'MY' },
        },
      },
    },

    // ── search-input — rule: SHOW when contactMethod in ["phone","sms"] (enum)─
    {
      __component: 'input.search-input',
      componentId: 'areaCode',
      span: '12',
      placeholder: 'Search area code',
      type: 'string',
      disabled: false,
      rule: {
        effect: 'SHOW',
        condition: {
          scope: 'contactMethod',
          schema: { enum: ['phone', 'sms'] },
        },
      },
    },

    // ── checkbox with choices (multi-select) ─────────────────────────────────
    {
      __component: 'input.checkbox',
      componentId: 'notifications',
      span: '12',
      label: 'Notification Preferences',
      choices: [
        { value: 'news', label: 'News & Updates' },
        { value: 'promos', label: 'Promotions' },
        { value: 'reminders', label: 'Reminders' },
      ],
    },

    // ── toggle — drives ENABLE / DISABLE rules below ─────────────────────────
    {
      __component: 'input.toggle',
      componentId: 'agreeToTerms',
      span: '12',
      required: true,
      type: 'boolean',
      size: 'md',
      messages: {
        required: 'You must agree to the terms',
      },
    },

    // ── text-input — rule: ENABLE when agreeToTerms == true (const boolean) ──
    {
      __component: 'input.text-input',
      componentId: 'promoCode',
      span: '12',
      label: 'Promo Code',
      placeholder: 'Enter promo code (optional)',
      type: 'string',
      dependsOn: [{ componentId: 'agreeToTerms' }],
      rule: {
        effect: 'ENABLE',
        condition: {
          scope: 'agreeToTerms',
          schema: { const: true },
        },
      },
    },

    // ── slider — rule: DISABLE when agreeToTerms == false (const boolean) ────
    {
      __component: 'input.slider',
      componentId: 'discountLevel',
      span: '12',
      label: 'Discount Level (%)',
      type: 'number',
      min: 0,
      max: 100,
      step: 10,
      rule: {
        effect: 'DISABLE',
        condition: {
          scope: 'agreeToTerms',
          schema: { const: false },
        },
      },
    },

    // ── number-input-stepper ─────────────────────────────────────────────────
    {
      __component: 'input.number-input-stepper',
      componentId: 'quantity',
      span: '12',
      label: 'Quantity',
      type: 'number',
      min: 1,
      max: 99,
      step: 1,
      editable: true,
    },

    // ── pin-input ────────────────────────────────────────────────────────────
    {
      __component: 'input.pin-input',
      componentId: 'verificationPin',
      span: '12',
      required: true,
      type: 'string',
      numberOfDigits: 6,
      inputMode: 'numeric',
      secureTextEntry: false,
      autoFocus: false,
      messages: {
        required: 'Verification PIN is required',
      },
    },

    // ── uploader ─────────────────────────────────────────────────────────────
    {
      __component: 'input.uploader',
      componentId: 'supportingDocs',
      span: '12',
      maxFiles: 3,
      maxFileSizeBytes: 5242880,
      autoUpload: false,
      disabled: false,
    },
  ],

  footer: [
    {
      __component: 'action.button',
      componentId: 'submitButton',
      span: '12',
      label: 'Submit',
      variant: 'primary',
      type: 'filled',
      size: 'lg',
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
