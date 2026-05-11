import type { FormFieldMeta } from '../../../core/dsl/type'

export type FieldLayoutProps = {
  meta: FormFieldMeta
  label: string
  error?: string
  children: React.ReactNode
}
