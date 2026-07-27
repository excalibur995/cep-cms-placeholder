import * as React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Field, TextInput } from '@strapi/design-system';

interface ParentLanguageIdInputProps {
  name: string;
  value?: string | null;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
}

/**
 * Custom input for `notification-template.parentLanguageId`.
 *
 * On create, the value defaults to the locale carried by the content-manager
 * URL (`?plugins[i18n][locale]=en`). The field stays editable so the default
 * can be overridden; an existing value is never overwritten.
 */
const ParentLanguageIdInput = React.forwardRef<HTMLInputElement, ParentLanguageIdInputProps>(
  ({ name, value, label, hint, error, required, disabled, onChange }, ref) => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const locale = searchParams.get('plugins[i18n][locale]');
    const isCreating = id === 'create';

    React.useEffect(() => {
      if (!isCreating || !locale || value) {
        return;
      }

      onChange({ target: { name, value: locale, type: 'string' } });
    }, [isCreating, locale, value, name, onChange]);

    return (
      <Field.Root name={name} hint={hint} error={error} required={required}>
        <Field.Label>{label}</Field.Label>
        <TextInput
          ref={ref}
          name={name}
          value={value ?? ''}
          disabled={disabled}
          onChange={onChange}
        />
        <Field.Hint />
        <Field.Error />
      </Field.Root>
    );
  }
);

ParentLanguageIdInput.displayName = 'ParentLanguageIdInput';

export default ParentLanguageIdInput;
