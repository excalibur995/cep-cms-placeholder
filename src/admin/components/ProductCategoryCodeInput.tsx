import * as React from 'react';
import { Field, Combobox, ComboboxOption } from '@strapi/design-system';
import { useField } from '@strapi/strapi/admin';

interface ProductCategoryCodeInputProps {
  name: string;
  value?: string | null;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
}

interface CategoryCodeOption {
  productCategoryCode: string;
  productCategoryName?: string;
  productGroupCode?: string;
}

/**
 * Custom input for a product category code. Renders a searchable dropdown whose
 * options are loaded from `GET /api/product-categories/codes` and then filtered
 * by the `productGroupCode` selected elsewhere in the same form — so the
 * category choices always follow the chosen group. The stored value is the
 * plain code string.
 */
const ProductCategoryCodeInput = React.forwardRef<HTMLInputElement, ProductCategoryCodeInputProps>(
  ({ name, value, label, hint, error, required, disabled, onChange }, ref) => {
    const [options, setOptions] = React.useState<CategoryCodeOption[]>([]);
    const { value: groupCode } = useField<string>('productGroupCode');

    React.useEffect(() => {
      let active = true;
      fetch('/api/product-categories/codes')
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

    // Only categories that belong to the chosen group. With no group selected,
    // fall back to the full list.
    const filteredOptions = React.useMemo(
      () =>
        groupCode
          ? options.filter((opt) => opt.productGroupCode === groupCode)
          : options,
      [options, groupCode],
    );

    // If the group changes and the current category no longer belongs to it,
    // clear the selection so the two fields never disagree.
    React.useEffect(() => {
      if (!groupCode || !value) return;
      const current = options.find((opt) => opt.productCategoryCode === value);
      if (current && current.productGroupCode !== groupCode) {
        onChange({ target: { name, value: '', type: 'string' } });
      }
    }, [groupCode, value, options, name, onChange]);

    // Keep the current value selectable even if it is not in the filtered list
    // yet (e.g. options still loading), so an existing entry never looks empty.
    const hasValue = value && filteredOptions.some((opt) => opt.productCategoryCode === value);
    const allOptions =
      value && !hasValue ? [{ productCategoryCode: value }, ...filteredOptions] : filteredOptions;

    return (
      <Field.Root name={name} hint={hint} error={error} required={required}>
        <Field.Label>{label}</Field.Label>
        <Combobox
          ref={ref}
          name={name}
          value={value ?? ''}
          disabled={disabled}
          placeholder={groupCode ? 'Search a product category code' : 'Select a product group first'}
          onChange={(next?: string) =>
            onChange({ target: { name, value: next ?? '', type: 'string' } })
          }
          onClear={() => onChange({ target: { name, value: '', type: 'string' } })}
        >
          {allOptions.map((opt) => (
            <ComboboxOption key={opt.productCategoryCode} value={opt.productCategoryCode}>
              {opt.productCategoryName
                ? `${opt.productCategoryCode} — ${opt.productCategoryName}`
                : opt.productCategoryCode}
            </ComboboxOption>
          ))}
        </Combobox>
        <Field.Hint />
        <Field.Error />
      </Field.Root>
    );
  }
);

ProductCategoryCodeInput.displayName = 'ProductCategoryCodeInput';

export default ProductCategoryCodeInput;
