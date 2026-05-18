import type { UIAnnotation } from '@gyomu/schema/entity'

export type FormFieldMeta = UIAnnotation & {
  name: string
  options: Record<string, any>
  required?: boolean
}
