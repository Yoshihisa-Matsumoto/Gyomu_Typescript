import type { FormFieldMeta } from '@gyomu/ui-core/dsl'

/**
 * A functional component type for rendering a specific form field, receiving metadata and input event handlers.
 *
 * @param props The configuration object containing field metadata, current value, and state change callbacks.
 *
 * @param meta Metadata describing the field configuration and state.
 *
 * @param value The current value of the field.
 *
 * @param onChange Callback invoked when the field value changes.
 *
 * @param onBlur Callback invoked when the field loses focus.
 *
 * @param error An optional error message associated with the field.
 *
 * @returns A React node representing the rendered field.
 */
export type FieldRenderer = (props: {
  meta: FormFieldMeta
  value?: any
  onChange?: (v: any) => void
  onBlur?: () => void
  error?: string
}) => React.ReactNode
