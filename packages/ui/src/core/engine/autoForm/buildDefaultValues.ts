import type { FormFieldMeta } from '../../dsl/type'

export function buildDefaultValues(
  fieldConfigs: Array<FormFieldMeta>,
  initialValues?: Record<string, any>,
) {
  const result: Record<string, any> = {}

  for (const field of fieldConfigs) {
    if (initialValues && field.name in initialValues) {
      result[field.name] = initialValues[field.name]
      continue
    }

    switch (field.widget) {
      case 'number':
        result[field.name] = undefined
        break
      // case 'checkbox':
      //   result[field.name] = false;
      //   break;
      default:
        result[field.name] = ''
    }
  }

  return result
}
