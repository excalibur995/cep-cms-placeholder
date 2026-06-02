import { transformZone } from '../src/api/stp-screen/controllers/transform';
import { aggregateSchema } from '../src/api/stp-screen/controllers/schema-aggregator';

const fixture = {
  header: [
    { __component: 'navigation.top-navigation', id: 1, span: '12', componentId: 'top_nav' },
    { __component: 'core.typo', id: 2, span: '12', componentId: 'subtitle', variant: 'subtitle', value: 'Global Access Account' },
    { __component: 'core.typo', id: 3, span: '12', componentId: 'title', variant: 'title1', value: 'Your Email Address' },
  ],
  body: [
    {
      __component: 'input.text-input', id: 10, span: '12', componentId: 'emailInput',
      label: 'Email Address', placeholder: 'Enter your email address',
      required: true, type: 'email', minLength: 10, maxLength: 200,
      messages: { id: 100, required: 'Email is required', email: 'Enter a valid email', minLength: 'Min 10 chars' },
      dynamic: { enabled: true, type: 'VALUE', target: 'defaultValue', source: { type: 'FACT', path: 'userEmail' } },
    },
    {
      __component: 'input.text-input', id: 11, span: '12', componentId: 'confirmEmailInput',
      label: 'Confirm Email Address', placeholder: 'Re-enter your email address',
      required: true, type: 'email', minLength: 10, maxLength: 200,
      messages: { id: 101, required: 'Confirmation is required', email: 'Enter a valid email' },
    },
  ],
  footer: [
    { __component: 'action.button', id: 20, span: '12', componentId: 'nextButton', label: 'Next', variant: 'primary' },
    { __component: 'container.divider', id: 21, span: '12', componentId: 'divider' },
    { __component: 'action.button', id: 22, span: '12', componentId: 'google', label: 'Continue with Google', variant: 'secondary', iconName: 'google' },
    { __component: 'action.button', id: 23, span: '12', componentId: 'apple', label: 'Continue with Apple', variant: 'secondary', iconName: 'apple' },
  ],
  mixed: [
    { __component: 'core.typo', id: 30, span: '6', componentId: 'a', value: 'Label A' },
    { __component: 'action.button', id: 31, span: '6', componentId: 'b', label: 'Go' },
    { __component: 'core.typo', id: 32, span: '6', componentId: 'c', value: 'Label B' },
    { __component: 'core.typo', id: 33, span: '6', componentId: 'd', value: 'Label C' },
    { __component: 'input.text-input', id: 34, span: '6', componentId: 'rt', label: 'RT' },
    { __component: 'input.text-input', id: 35, span: '6', componentId: 'rw', label: 'RW' },
  ],
};

console.log('\n========== HEADER ==========');
console.log(JSON.stringify(transformZone(fixture.header), null, 2));

console.log('\n========== BODY ==========');
console.log(JSON.stringify(transformZone(fixture.body), null, 2));

console.log('\n========== FOOTER ==========');
console.log(JSON.stringify(transformZone(fixture.footer), null, 2));

console.log('\n========== MIXED EDGE CASES ==========');
console.log(JSON.stringify(transformZone(fixture.mixed), null, 2));

console.log('\n========== SCHEMA AGGREGATION ==========');
const schema = aggregateSchema([fixture.header, fixture.body, fixture.footer]);
console.log(JSON.stringify(schema, null, 2));

console.log('\n========== DATA ==========');
const data = Object.fromEntries(Object.keys(schema).map((k) => [k, '']));
console.log(JSON.stringify(data, null, 2));
