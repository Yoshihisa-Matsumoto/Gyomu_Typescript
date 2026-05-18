import type { FormFieldMeta } from '@gyomu/ui-core/dsl'

export type FieldLayoutProps = {
  meta: FormFieldMeta
  label: string
  error?: string
  children: React.ReactNode
}
