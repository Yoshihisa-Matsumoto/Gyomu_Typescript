import { Field, FieldError, FieldLabel } from '../../../components/ui/field'

import type { FieldLayoutProps } from '../../../components/layout/types'

/**
 * A layout component for form fields using Shadcn UI styles, handling metadata, labels, error messages, and child content.
 *
 * @param props The properties for the field layout, including metadata, label, error status, and child elements.
 *
 * @returns Returns a JSX element representing the rendered field layout.
 */
export function ShadcnFieldLayout({ meta, label, error, children }: FieldLayoutProps) {
  return (
    <Field {...(meta.widget == 'hidden' ? { style: { display: 'none' } } : {})}>
      <FieldLabel htmlFor={meta.name}>{label}</FieldLabel>
      {children}
      <FieldError errors={error ? [{ message: error }] : []} />
    </Field>
  )
}
