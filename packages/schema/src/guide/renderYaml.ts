import type { GuideNode } from './types.js'

/**
 * Renders a guide node structure into a YAML-formatted string representation.
 *
 * @param node The guide node to render.
 *
 * @param indent The current indentation level, defaults to 0.
 *
 * @param prefix Optional prefix string to prepend to the output.
 *
 * @returns The resulting YAML-formatted string.
 */
export const renderyaml = (node: GuideNode, indent: number = 0, prefix?: string): string => {
  let yaml = ''

  const indentStr = '  '.repeat(indent)
  const indentStrForComment = '  '.repeat(indent)
  switch (node.kind) {
    case 'object':
      {
        if (node.description) {
          yaml += `\n${indentStr}# ${renderComment(node.description, indentStr)}\n`
        }

        node.properties.forEach((property, index) => {
          if (index == 0 && prefix) yaml += ''
          else yaml += `\n${indentStr}`
          yaml += `  ${property.name}${property.node.optional ? '?' : ''}:${renderyaml(property.node, indent + 2)}\n`
        })
      }
      break
    case 'array':
      {
        if (node.description) {
          yaml += `\n${indentStr}# ${renderComment(node.description, indentStr)}\n`
        }
        yaml += `${indentStr}- ${renderyaml(node.elementType, indent + 1, '- ')}`
      }
      break
    case 'union':
      {
        if (node.description) {
          yaml += `\n${indentStr}# ${renderComment(node.description, indentStr)}\n`
        }
        yaml += `${indentStr}` + node.types.map((tp) => renderyaml(tp)).join(' | ')
      }
      break
    case 'enum':
      if (node.description)
        yaml += `\n${indentStr}# ${renderComment(node.description, indentStr)}\n`
      yaml += node.values
        .map((v) => {
          if (Array.isArray(v)) return v[0]
          return String(v)
        })
        .join(' | ')

      break
    case 'recursive':
      yaml += '<recursive>'
      break
    case 'literal':
      if (node.description)
        yaml += `\n${indentStrForComment}# ${renderComment(node.description, indentStr)}\n`
      if (yaml.length > 0) yaml += `${indentStr}`
      yaml +=
        typeof node.value == 'number' || typeof node.value == 'bigint'
          ? node.value.toString()
          : typeof node.value == 'boolean'
            ? String(node.value)
            : `"${String(node.value)}"`
      break
    default:
      if (node.description)
        yaml += `\n${indentStrForComment}# ${renderComment(node.description, indentStr)}\n`
      if (yaml.length > 0) yaml += `${indentStr}`
      yaml += node.kind
  }

  return yaml
}

const renderComment = (description: string, indentStr: string) => {
  const lines = description.split('\n')
  return lines.filter((v) => v.length > 0).join(`\n${indentStr}# `)
}
