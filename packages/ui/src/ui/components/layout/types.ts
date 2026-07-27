import type { FormFieldMeta } from '@gyomu/ui-core/dsl'

/**
 * Defines the properties for a form field layout, including field metadata, display labels, optional error messages, and the field content.
 *
 * @param meta The metadata associated with the form field.
 *
 * @param label The display label for the form field.
 *
 * @param error An optional error message to display for the field.
 *
 * @param children The content of the form field to be rendered.
 */
export type FieldLayoutProps = {
  meta: FormFieldMeta
  label: string
  error?: string
  children: React.ReactNode
}
