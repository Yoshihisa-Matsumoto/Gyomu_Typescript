import { withOptional } from '@gyomu/schema'
import { NumberField, Select, TextArea, TextField } from '../../adapters/mui'
import type { LocalDate } from '@gyomu/schema/entity'
import type { RendererMap } from '@gyomu/ui-core/engine'

/**
 * A mapping object providing Material-UI component implementations for various UI field types.
 */
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
      onChange={(e) => onChange?.(e.target.value === '' ? undefined : Number(e.target.value))}
    />
  ),

  select: ({ value, onChange, onBlur, meta }) => (
    <Select
      value={(value ?? '') as string}
      onChange={(v) => onChange?.(v)}
      {...withOptional({ onBlur })}
      items={Object.entries(meta.enumAttribute).map(([v, attr]) => ({
        value,
        label: getLabel(attr, v),
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
}

const getLabel = (
  attribute: {
    label?: string | ((value: string) => string)
    order?: number
    disabled?: boolean
  },
  value: string,
) => {
  if (typeof attribute.label === 'function') return attribute.label(value)
  return attribute.label ?? value
}
