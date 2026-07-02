import { withOptional } from '@gyomu/schema'
import { buildExistingJsDoc } from './buildExistingJsDoc.js'
import type { FileAnalysisResult } from '@gyomu/ts-analysis'
import type { ContextEntry, DocumentableInfo } from '@gyomu/ai-compiler/jsdoc-update'
import type {
  DocumentableMemberAnalysis,
  MemberAnalysis,
  NonDocumentableMemberAnalysis,
  SymbolAnalysis,
  TypeStructureAnalysis,
} from '@gyomu/schema/typescript'

export const buildContextEntry = (
  fileResult: FileAnalysisResult,
  member: DocumentableMemberAnalysis | NonDocumentableMemberAnalysis,
  parent: SymbolAnalysis | MemberAnalysis,
): ContextEntry => {
  const jsDocAnalysis = member.documentable ? member.jsDoc : undefined
  // const hasJsDoc = jsDocAnalysis != undefined && jsDocAnalysis.exists

  const generateResult = shouldGenerateDoc(member, parent)

  const parsedJsDoc = fileResult.metadata.parsedJsDocs.get(JSON.stringify(member.identity))

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
      const children: Array<MemberAnalysis> = []
      switch (structure?.kind) {
        case 'object':
          if (structure.members) children.push(...structure.members)
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
            .map((m) => buildContextEntry(fileResult, m, member)),
        }),
        ...generateResult,
      }
    }
  }
}

const shouldGenerateDoc = (
  member: MemberAnalysis,
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
