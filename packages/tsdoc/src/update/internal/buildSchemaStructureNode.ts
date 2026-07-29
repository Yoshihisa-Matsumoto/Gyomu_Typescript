import type { SchemaStructureNode } from '@gyomu/ai-compiler/jsdoc-update'
import type { TypeProperty, TypeStructureAnalysis } from '@gyomu/schema/schemas/typescript'

/**
 * Recursively builds a structured node representation from a type structure analysis.
 *
 * @param member The type structure analysis object to process.
 *
 * @param name The name of the schema structure node.
 *
 * @returns A SchemaStructureNode representing the analyzed type, or undefined if the structure cannot be mapped.
 */
export const buildSchemaStructureNode = (
  member: TypeStructureAnalysis,
  name: string,
): SchemaStructureNode | undefined => {
  // const hasJsDoc = jsDocAnalysis != undefined && jsDocAnalysis.exists

  switch (member.kind) {
    case 'object':
      if (member.properties) {
        return {
          name,
          kind: 'object',
          children: [
            ...member.properties
              .map((m) => buildSchemaStructureNodeFromTypeProperty(m))
              .flat()
              .filter((m) => !!m),
          ],
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

        type: member.elementValue?.toString() ?? '',
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

// const buildSchemaStructureNodeFromIndexSignature = (
//   member: IndexSignatureAnalysis,
// ): Array<SchemaStructureNode> => {
//   const result:Array<SchemaStructureNode>=[]
//   if (!member.parameterType || member.parameterType.source != 'effect-schema' || !member.parameterType.structure)
//   {
//     // Do nothing
//   }else {
//     const structure = member.parameterType.structure
//     if(structure)
//       result.push( buildSchemaStructureNode(structure, member.parameterName))
//   }

//   if(member.type && member.type.structure && member.type.)
//   return result
// }
