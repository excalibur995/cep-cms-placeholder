import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Field, TextInput } from '@strapi/design-system';

interface TemplateIdInputProps {
  name?: string;
  value?: string | null;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Custom input for `notification-template.templateId`.
 *
 * - On create: the field is hidden entirely (the id is auto-generated as a
 *   UUID v4 server-side by generateTemplateIdMiddleware on save).
 * - On edit: the existing id is shown as a read-only field. Place it at the top
 *   of the layout via "Configure the view" so it reads as the record header.
 */
const TemplateIdInput = React.forwardRef<HTMLInputElement, TemplateIdInputProps>(
  ({ name, value, label, hint, error }, ref) => {
    const { id } = useParams();
    const isCreating = id === 'create';

    if (isCreating || !value) {
      return null;
    }

    return (
      <Field.Root name={name} hint={hint} error={error}>
        <Field.Label>{label}</Field.Label>
        <TextInput ref={ref} name={name} value={value ?? ''} disabled />
        <Field.Hint />
        <Field.Error />
      </Field.Root>
    );
  }
);

TemplateIdInput.displayName = 'TemplateIdInput';

export default TemplateIdInput;
