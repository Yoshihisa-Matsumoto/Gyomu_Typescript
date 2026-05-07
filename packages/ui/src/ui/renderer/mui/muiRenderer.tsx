import { Select, TextArea, TextField, NumberField } from '@ui/adapters/mui';
import { StrictFieldPropsMap } from '@core/engine/autoForm/types.js';
import { withOptional } from '@gyomu/shared';

export const muiRenderer: StrictFieldPropsMap = {
  text: ({ value, onChange, onBlur, meta }) => (
    <TextField
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      placeholder={meta.placeholder ?? meta.name}
    />
  ),

  'email-text': ({ value, onChange, onBlur, meta }) => (
    <TextField
      type="email"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      placeholder={meta.placeholder ?? meta.name}
    />
  ),

  'password-text': ({ value, onChange, onBlur, meta }) => (
    <TextField
      type="password"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      placeholder={meta.placeholder ?? meta.name}
    />
  ),

  textarea: ({ value, onChange, onBlur }) => (
    <TextArea
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
    />
  ),

  number: ({ value, onChange }) => (
    <NumberField
      value={value ?? ''}
      onChange={(e) =>
        onChange?.(e.target.value === '' ? undefined : Number(e.target.value))
      }
    />
  ),

  select: ({ value, onChange, onBlur, options }) => (
    <Select
      value={(value ?? '') as string}
      onChange={(v) => onChange?.(v)}
      {...withOptional({ onBlur })}
      items={options.map((opt) => ({
        value: opt.value,
        label: opt.label,
      }))}
    />
  ),

  date: ({ value, onChange, onBlur }) => (
    <TextField
      type="date"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
    />
  ),
  hidden: ({ value }) => <input type="hidden" value={value ?? ''} />,
};
