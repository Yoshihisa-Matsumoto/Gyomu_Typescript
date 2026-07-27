import type { FormFieldMeta } from '../../dsl/type.js'

/**
 * Constructs an object of default form values based on the provided field configurations and optional initial values.
 *
 * @param fieldConfigs An array of form field metadata definitions.
 *
 * @param initialValues Optional pre-existing values to merge into the result.
 *
 * @returns An object containing the resolved default values for each form field.
 */
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
