import * as React from 'react';
import { Field, Combobox, ComboboxOption } from '@strapi/design-system';

interface ProductGroupCodeInputProps {
  name: string;
  value?: string | null;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
}

interface GroupCodeOption {
  productGroupCode: string;
  productGroupName?: string;
}

/**
 * Custom input for a product group code. Renders a searchable dropdown whose
 * options are loaded from `GET /api/product-groups/codes` — the distinct set of
 * codes declared across the Product Group collection. The stored value is the
 * plain code string, so nothing about the underlying data model changes.
 */
const ProductGroupCodeInput = React.forwardRef<HTMLInputElement, ProductGroupCodeInputProps>(
  ({ name, value, label, hint, error, required, disabled, onChange }, ref) => {
    const [options, setOptions] = React.useState<GroupCodeOption[]>([]);

    React.useEffect(() => {
      let active = true;
      fetch('/api/product-groups/codes')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (active) setOptions(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (active) setOptions([]);
        });
      return () => {
        active = false;
      };
    }, []);

    // Keep the current value selectable even if it is not (yet) in the fetched
    // list, so an existing entry never shows an empty dropdown.
    const hasValue = value && options.some((opt) => opt.productGroupCode === value);
    const allOptions =
      value && !hasValue ? [{ productGroupCode: value }, ...options] : options;

    return (
      <Field.Root name={name} hint={hint} error={error} required={required}>
        <Field.Label>{label}</Field.Label>
        <Combobox
          ref={ref}
          name={name}
          value={value ?? ''}
          disabled={disabled}
          placeholder="Search a product group code"
          onChange={(next?: string) =>
            onChange({ target: { name, value: next ?? '', type: 'string' } })
          }
          onClear={() => onChange({ target: { name, value: '', type: 'string' } })}
        >
          {allOptions.map((opt) => (
            <ComboboxOption key={opt.productGroupCode} value={opt.productGroupCode}>
              {opt.productGroupName
                ? `${opt.productGroupCode} — ${opt.productGroupName}`
                : opt.productGroupCode}
            </ComboboxOption>
          ))}
        </Combobox>
        <Field.Hint />
        <Field.Error />
      </Field.Root>
    );
  }
);

ProductGroupCodeInput.displayName = 'ProductGroupCodeInput';

export default ProductGroupCodeInput;
