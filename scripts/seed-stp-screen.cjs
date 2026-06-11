'use strict';

/**
 * Seed script: creates sample overlays + an stp-screen that references them.
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
 *   - dependent + endpoint (cascade dropdowns)
 *   - dynamic source (VALUE from FACT)
 *   - messages validation
 *   - HorizontalLayout via span-6 pair
 *   - Nested property group (personalData.*)
 *   - Overlay: modal (confirmLeave) + bottom-sheet (promoInfo)
 *   - show_modal / close_modal action types
 */

const RUN = process.argv.includes('--run');

// ── Overlays ──────────────────────────────────────────────────────────────────

const OVERLAY_CONFIRM_LEAVE = {
  overlayId: 'confirmLeave',
  type: 'modal',
  publishedAt: new Date().toISOString(),

  header: [
    {
      __component: 'core.typo',
      componentId: 'confirmLeaveTitle',
      span: '12',
      value: 'Leave Application?',
      type: 'title2',
      weight: 'bold',
    },
  ],

  body: [
    {
      __component: 'core.typo',
      componentId: 'confirmLeaveBody',
      span: '12',
      value: 'Your progress will be saved. You can continue from where you left off.',
      type: 'body',
      weight: 'regular',
    },
  ],

  footer: [
    // span-6 pair → HorizontalLayout
    {
      __component: 'action.button',
      componentId: 'cancelLeaveBtn',
      span: '6',
      label: 'Cancel',
      type: 'secondary',
      size: 'lg',
      action: { type: 'close_modal' },
    },
    {
      __component: 'action.button',
      componentId: 'confirmLeaveBtn',
      span: '6',
      label: 'Leave',
      type: 'primary',
      variant: 'destructive',
      size: 'lg',
      action: { type: 'navigate', payload: { target: 'home' } },
    },
  ],
};

const OVERLAY_PROMO_INFO = {
  overlayId: 'promoInfo',
  type: 'bottom-sheet',
  publishedAt: new Date().toISOString(),

  header: [
    {
      __component: 'core.typo',
      componentId: 'promoInfoTitle',
      span: '12',
      value: 'About Promo Code',
      type: 'title2',
      weight: 'bold',
    },
  ],

  body: [
    {
      __component: 'core.typo',
      componentId: 'promoInfoDesc',
      span: '12',
      value: 'Enter a valid promo code to unlock exclusive discounts on your application fee.',
      type: 'body',
      weight: 'regular',
    },
    {
      __component: 'core.typo',
      componentId: 'promoInfoNote',
      span: '12',
      value: 'Promo codes are case-sensitive and can only be used once per account.',
      type: 'footnote',
      weight: 'regular',
    },
  ],

  footer: [
    {
      __component: 'action.button',
      componentId: 'promoInfoClose',
      span: '12',
      label: 'Got it',
      type: 'primary',
      size: 'lg',
      action: { type: 'close_modal' },
    },
  ],
};

// ── Screen ────────────────────────────────────────────────────────────────────

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
      type: 'title2',
      textAlign: 'center',
    },
    {
      __component: 'core.typo',
      componentId: 'screenSubtitle',
      span: '12',
      value: 'Fill in all fields below',
      type: 'body',
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

    // ── dropdown with static choices ─────────────────────────────────────────
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

    // ── dropdown with endpoint (remote) — depends on country ─────────────────
    // schema.url + endpoint = "regions"; dependent on country → cascade reset
    {
      __component: 'input.dropdown',
      componentId: 'region',
      span: '12',
      label: 'Region',
      placeholder: 'Select your region',
      required: true,
      type: 'string',
      endpoint: 'regions',
      dependent: [{ componentId: 'country' }],
      messages: {
        required: 'Please select a region',
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
      dependent: [{ componentId: 'contactMethod' }],
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
      dependent: [{ componentId: 'agreeToTerms' }],
      rule: {
        effect: 'ENABLE',
        condition: {
          scope: 'agreeToTerms',
          schema: { const: true },
        },
      },
    },

    // ── button — show_modal action → opens promoInfo bottom-sheet ────────────
    {
      __component: 'action.button',
      componentId: 'promoInfoBtn',
      span: '12',
      label: 'What is a promo code?',
      type: 'tertiary',
      size: 'sm',
      action: { type: 'show_modal', payload: { overlayId: 'promoInfo' } },
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

    // ── nested object: personalData.* ────────────────────────────────────────
    {
      __component: 'input.number-input-stepper',
      componentId: 'personalData.age',
      span: '12',
      label: 'Age',
      required: true,
      type: 'integer',
      min: 18,
      max: 99,
      step: 1,
      editable: true,
      messages: {
        required: 'Please enter your age',
      },
    },
    {
      __component: 'input.number-input-stepper',
      componentId: 'personalData.height',
      span: '12',
      label: 'Height (cm)',
      required: true,
      type: 'number',
      min: 50,
      max: 250,
      step: 1,
      editable: true,
      messages: {
        required: 'Please enter your height',
      },
    },
    {
      __component: 'input.slider',
      componentId: 'personalData.drivingSkill',
      span: '12',
      label: 'Driving Skill',
      type: 'number',
      min: 1,
      max: 10,
      step: 1,
    },

    // ── button — show_modal action → opens confirmLeave modal ────────────────
    {
      __component: 'action.button',
      componentId: 'leaveBtn',
      span: '12',
      label: 'Leave Application',
      type: 'secondary',
      size: 'md',
      action: { type: 'show_modal', payload: { overlayId: 'confirmLeave' } },
    },
  ],

  footer: [
    {
      __component: 'action.button',
      componentId: 'submitButton',
      span: '12',
      label: 'Submit',
      type: 'primary',
      size: 'lg',
      action: { type: 'submit' },
    },
  ],
};

// ── Dry-run ───────────────────────────────────────────────────────────────────

if (!RUN) {
  console.log('=== DRY RUN — add --run to insert ===\n');
  console.log('=== OVERLAYS ===\n');
  console.log(JSON.stringify(OVERLAY_CONFIRM_LEAVE, null, 2));
  console.log();
  console.log(JSON.stringify(OVERLAY_PROMO_INFO, null, 2));
  console.log('\n=== SCREEN ===\n');
  console.log(JSON.stringify(SCREEN, null, 2));
  process.exit(0);
}

// ── Run ───────────────────────────────────────────────────────────────────────

async function run() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const app = await createStrapi(await compileStrapi()).load();

  const overlay1 = await app.documents('api::overlay.overlay').create({ data: OVERLAY_CONFIRM_LEAVE });
  console.log(`Created overlay: documentId=${overlay1.documentId} overlayId="${overlay1.overlayId}" type="${overlay1.type}"`);

  const overlay2 = await app.documents('api::overlay.overlay').create({ data: OVERLAY_PROMO_INFO });
  console.log(`Created overlay: documentId=${overlay2.documentId} overlayId="${overlay2.overlayId}" type="${overlay2.type}"`);

  const screenData = {
    ...SCREEN,
    overlay: { connect: [overlay1.documentId, overlay2.documentId] },
  };

  const doc = await app.documents('api::stp-screen.stp-screen').create({ data: screenData });
  console.log(`Created screen: documentId=${doc.documentId} screenId="${doc.screenId}" v${doc.version}`);

  await app.destroy();
}

run().catch((err) => { console.error(err); process.exit(1); });
