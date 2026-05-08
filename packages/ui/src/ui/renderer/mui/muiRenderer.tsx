import { withOptional } from '@gyomu/core';
import { LocalDate } from '@gyomu/core/shared/entity';
import { RendererMap } from '../../../core/engine/autoForm/types';
import { TextArea, NumberField, TextField, Select } from '../../adapters/mui';

export const muiRenderer: RendererMap = {
  text: ({ value, onChange, meta, onBlur }) => (
    <TextField
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
      placeholder={meta.placeholder}
    />
  ),

  // 'email-text': ({ value, onChange, onBlur, meta }) => (
  //   <TextField
  //     type="email"
  //     value={value ?? ''}
  //     onChange={(e) => onChange?.(e.target.value)}
  //     onBlur={onBlur}
  //     placeholder={meta.placeholder ?? meta.name}
  //   />
  // ),

  // 'password-text': ({ value, onChange, onBlur, meta }) => (
  //   <TextField
  //     type="password"
  //     value={value ?? ''}
  //     onChange={(e) => onChange?.(e.target.value)}
  //     onBlur={onBlur}
  //     placeholder={meta.placeholder ?? meta.name}
  //   />
  // ),

  textarea: ({ value, onChange, onBlur }) => (
    <TextArea
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
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

  select: ({ value, onChange, onBlur, meta }) => (
    <Select
      value={(value ?? '') as string}
      onChange={(v) => onChange?.(v)}
      {...withOptional({ onBlur })}
      items={Object.keys(meta.enumAttribute).map((opt) => ({
        value: opt,
        label: getLabel(meta.enumAttribute[opt]!, opt),
      }))}
    />
  ),

  date: ({ value, onChange, onBlur }) => (
    <TextField
      type="date"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value as LocalDate)}
      onBlur={(e) => onBlur?.(e.target.value as LocalDate)}
    />
  ),
  hidden: ({ value }) => <input type="hidden" value={value ?? ''} />,
};

const getLabel = (
  attribute: {
    label?: string | ((value: string) => string);
    order?: number;
    disabled?: boolean;
  },
  value: string,
) => {
  if (typeof attribute.label === 'function') return attribute.label(value);
  return attribute.label ?? value;
};
