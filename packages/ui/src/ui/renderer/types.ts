import type { FormFieldMeta } from '@gyomu/ui-core/dsl'

export type FieldRenderer = (props: {
  meta: FormFieldMeta
  value?: any
  onChange?: (v: any) => void
  onBlur?: () => void
  error?: string
}) => React.ReactNode
