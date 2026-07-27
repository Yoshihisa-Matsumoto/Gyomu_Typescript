import { withOptional } from '@gyomu/schema'
import { buildExistingJsDoc } from './buildExistingJsDoc.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { ContextEntry, DocumentableInfo } from '@gyomu/ai-compiler/jsdoc-update'
import type {
  DocumentableMemberAnalysis,
  IndexSignatureAnalysis,
  MemberAnalysis,
  NonDocumentableMemberAnalysis,
  SymbolAnalysis,
  TypeProperty,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'

/**
 * Constructs a context entry for a given code member, analyzing its JSDoc, return type, and structure to determine if documentation needs to be generated or updated.
 *
 * @param fileResult The file analysis context containing parsed metadata.
 *
 * @param member The code member to analyze.
 *
 * @param parent The parent symbol or member analysis.
 *
 * @returns Returns a ContextEntry object containing metadata about the target member.
 */
export const buildContextEntry = (
  fileResult: FileAnalysisContext,
  member: DocumentableMemberAnalysis | NonDocumentableMemberAnalysis,
  parent: SymbolAnalysis | MemberAnalysis,
): ContextEntry => {
  const jsDocAnalysis = member.documentable ? member.jsDoc : undefined
  // const hasJsDoc = jsDocAnalysis != undefined && jsDocAnalysis.exists

  const generateResult = shouldGenerateDoc(member, parent)

  const parsedJsDoc = fileResult.metadata.parsedJsDocs.get(member.id)

  switch (member.kind) {
    case 'method': {
      return {
        target: member.identity,
        kind: member.kind,
        name: member.name,
        effectSignals: member.returnType?.effect
          ? {
              success: member.returnType.effect.success,
              error: member.returnType.effect.error,
              requirements: member.returnType.effect.requirements,
            }
          : undefined,
        ...withOptional({
          type: member.returnType?.text,
          existingJsDoc: buildExistingJsDoc(jsDocAnalysis, parsedJsDoc),

          children: member.parameters
            // .filter((p) => p.documentable)
            .map((m) => buildContextEntry(fileResult, m, member)),
        }),
        ...generateResult,
      }
    }
    case 'property': {
      const structure: TypeStructureAnalysis | undefined = member.type?.structure
      const children: Array<TypeProperty> = []
      switch (structure?.kind) {
        case 'object':
          if (structure.properties) children.push(...structure.properties)
          break
        case 'function':
          children.push(...structure.parameters)
          break
      }
      return {
        target: member.identity,
        kind: member.documentable ? member.kind : 'parameter',
        name: member.name,
        effectSignals: member.type?.effect
          ? {
              success: member.type.effect.success,
              error: member.type.effect.error,
              requirements: member.type.effect.requirements,
            }
          : undefined,
        ...withOptional({
          type: member.type?.text,
          existingJsDoc: buildExistingJsDoc(jsDocAnalysis, parsedJsDoc),

          children: children
            // .filter((p) => p.documentable)
            .map((m) => buildContextEntryFromTypeProperty(fileResult, m, member)),
        }),
        ...generateResult,
      }
    }
  }
}

const shouldGenerateDoc = (
  member: MemberAnalysis | TypeProperty,
  parent: SymbolAnalysis | MemberAnalysis,
): DocumentableInfo => {
  if (!member.documentable) {
    return {
      documentable: false,
      reason: 'non-documentable-member',
    }
  }
  if ('documentable' in parent) {
    // MemberAnalysis
    if (!parent.documentable)
      return {
        documentable: false,
        reason: 'non-documentable-member',
      }
    if (parent.location.startLine == member.location.startLine)
      return {
        documentable: false,
        reason: 'inline-object-member',
      }
  } else {
    if (parent.location.startLine == member.location.startLine)
      return {
        documentable: false,
        reason: 'inline-object-member',
      }
  }
  return { documentable: true }
}

const buildContextEntryFromTypeProperty = (
  fileResult: FileAnalysisContext,
  member: TypeProperty,
  parent: SymbolAnalysis | MemberAnalysis,
): ContextEntry => {
  const children: Array<ContextEntry> = []

  const jsDocAnalysis = member.documentable ? member.jsDoc : undefined

  const generateResult = shouldGenerateDoc(member, parent)

  const parsedJsDoc = fileResult.metadata.parsedJsDocs.get(member.id)

  if (member.type?.structure) {
    const structure = member.type.structure
    if (structure.kind == 'object') {
      const objectMembers = structure.properties?.map((m) =>
        buildContextEntryFromTypeProperty(fileResult, m, parent),
      )
      if (objectMembers) children.push(...objectMembers)
      const indexSignatures = structure.indexSignatures?.map((i) =>
        buildContextEntryFromIndexSignature(fileResult, i, parent),
      )
      if (indexSignatures) children.push(...indexSignatures)
    } else if (structure.kind == 'function') {
      const functionMembers = structure.parameters.map((m) =>
        buildContextEntryFromTypeProperty(fileResult, m, parent),
      )
      children.push(...functionMembers)
    }
  }
  return {
    target: member.identity,
    kind: 'type',
    name: member.name,
    effectSignals: member.type?.effect
      ? {
          success: member.type.effect.success,
          error: member.type.effect.error,
          requirements: member.type.effect.requirements,
        }
      : undefined,

    children,
    ...withOptional({
      type: member.type?.text,
      existingJsDoc: buildExistingJsDoc(jsDocAnalysis, parsedJsDoc),
    }),
    ...generateResult,
  }
}

const buildContextEntryFromIndexSignature = (
  fileResult: FileAnalysisContext,
  member: IndexSignatureAnalysis,
  parent: SymbolAnalysis | MemberAnalysis,
): ContextEntry => {
  const children: Array<ContextEntry> = []

  return {
    target: member.identity,
    kind: 'type',
    name: member.parameterName,
    effectSignals: member.type.effect
      ? {
          success: member.type.effect.success,
          error: member.type.effect.error,
          requirements: member.type.effect.requirements,
        }
      : undefined,

    children,
    ...withOptional({
      type: member.type.text,
    }),
  }
}
