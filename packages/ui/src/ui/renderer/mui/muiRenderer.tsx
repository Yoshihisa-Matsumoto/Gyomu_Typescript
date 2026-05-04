import { CheckBox, TextArea, TextField, NumberField } from '@ui/adapters/mui';
import { FieldRenderer } from '../types.js';

export const muiRenderer: Record<string, FieldRenderer> = {
  text: ({ value, onChange, onBlur, meta }) => (
    <TextField
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={meta.placeholder ?? meta.name}
    />
  ),

  textarea: ({ value, onChange, onBlur }) => (
    <TextArea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  ),

  number: ({ value, onChange }) => (
    <NumberField
      value={value ?? ''}
      onChange={(e) =>
        onChange(e.target.value === '' ? undefined : Number(e.target.value))
      }
    />
  ),

  checkbox: ({ value, onChange, onBlur }) => (
    <CheckBox
      checked={!!value}
      onChange={(e) => onChange(e.target.checked)}
      onBlur={onBlur}
    />
  ),
};
