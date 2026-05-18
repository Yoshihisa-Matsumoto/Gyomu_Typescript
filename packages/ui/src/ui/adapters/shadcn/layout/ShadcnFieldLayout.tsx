import { Field, FieldError, FieldLabel } from '../../../components/ui/field'

import type { FieldLayoutProps } from '../../../components/layout/types'

export function ShadcnFieldLayout({ meta, label, error, children }: FieldLayoutProps) {
  return (
    <Field {...(meta.widget == 'hidden' ? { style: { display: 'none' } } : {})}>
      <FieldLabel htmlFor={meta.name}>{label}</FieldLabel>
      {children}
      <FieldError errors={error ? [{ message: error }] : []} />
    </Field>
  )
}
