import { TemplateVariableNotFoundError } from './TemplateVariableNotFoundError.js'

export function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = variables[key]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (value === undefined) {
      throw new TemplateVariableNotFoundError(key)
    }

    return value
  })
}
