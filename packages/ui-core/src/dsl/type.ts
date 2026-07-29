import type { UIAnnotation } from '@gyomu/schema/entity'

/**
 * Defines metadata for a form field, including its identifier, configuration options, and mandatory status, extending base UI annotations.
 */
export type FormFieldMeta = UIAnnotation & {
  name: string
  options: Record<string, any>
  required?: boolean
}
