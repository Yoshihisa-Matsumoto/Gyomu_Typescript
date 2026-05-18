import { withOptional } from '@gyomu/schema'
import {
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '../../components/ui/index.js'
import type { LocalDate } from '@gyomu/schema/entity'
import type { RendererMap } from '@gyomu/ui-core/engine'

export const shadcnRenderer: RendererMap = {
  text: ({ value, onChange, meta, onBlur }) => (
    <Input
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
      placeholder={meta.placeholder}
    />
  ),

  textarea: ({ value, onChange, onBlur }) => (
    <Textarea
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
    />
  ),

  number: ({ value, onChange }) => (
    <Input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value === '' ? undefined : Number(e.target.value))}
    />
  ),

  select: ({ value, onChange, onBlur, meta }) => (
    <Select
      value={(value ?? '') as string}
      onValueChange={(v) => onChange?.(v)}
      {...withOptional({ onBlur })}
    >
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder={meta.placeholder ?? ''} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{meta.label}</SelectLabel>
          {Object.entries(meta.enumAttribute ?? {}).map(([v, attr]) => (
            <SelectItem key={v} value={v}>
              {getLabel(attr, v)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),

  date: ({ value, onChange, onBlur }) => (
    <Input
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
