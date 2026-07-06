import type { SchemaStructureNode } from '@gyomu/ai-compiler/jsdoc-update'
import type { TypeProperty, TypeStructureAnalysis } from '@gyomu/schema/schemas/typescript'

export const buildSchemaStructureNode = (
  member: TypeStructureAnalysis,
  name: string,
): SchemaStructureNode | undefined => {
  // const hasJsDoc = jsDocAnalysis != undefined && jsDocAnalysis.exists

  switch (member.kind) {
    case 'object':
      if (member.members) {
        return {
          name,
          kind: 'object',
          children: member.members
            .map((m) => buildSchemaStructureNodeFromTypeProperty(m))
            .flat()
            .filter((m) => !!m),
          annotations: member.annotations,
        }
      }
      return undefined
    case 'array': {
      if (member.elementType.structure && member.elementType.structure.kind == 'reference')
        return {
          name,
          kind: 'array',
          children: [
            {
              name: member.elementType.text,
              kind: 'reference',
              type: member.elementType.structure.targetId,
            },
          ],
          annotations: member.annotations,
        }
      else return undefined
    }
    case 'literal': {
      return {
        name,
        kind: 'literal',
        type: member.elementValue,
        annotations: member.annotations,
      }
    }
    case 'primitive': {
      return {
        name,
        kind: 'primitive',
        type: member.elementType,
        annotations: member.annotations,
      }
    }
    case 'reference': {
      return {
        name,
        kind: 'reference',
        type: member.targetId,
        annotations: member.annotations,
      }
    }
    case 'union': {
      return {
        name,
        kind: 'union',
        children: member.types
          .filter((tp) => tp.source == 'effect-schema' && tp.structure)
          .map((tp) => buildSchemaStructureNode(tp.structure as TypeStructureAnalysis, tp.text))
          .filter((c) => !!c),
        annotations: member.annotations,
      }
    }
  }
  return undefined
}

// const buildSchemaStructureNodeFromMemberAnalysis = (
//   member: MemberAnalysis,
// ): SchemaStructureNode | undefined => {
//   if (member.documentable) {
//     return undefined
//   }
//   if (member.kind == 'method') return undefined
//   if (!member.type || member.type.source != 'effect-schema' || !member.type.structure)
//     return undefined

//   return buildSchemaStructureNode(member.type.structure, member.name)
// }

const buildSchemaStructureNodeFromTypeProperty = (
  member: TypeProperty,
): SchemaStructureNode | undefined => {
  if (!member.type || member.type.source != 'effect-schema' || !member.type.structure)
    return undefined

  return buildSchemaStructureNode(member.type.structure, member.name)
}
