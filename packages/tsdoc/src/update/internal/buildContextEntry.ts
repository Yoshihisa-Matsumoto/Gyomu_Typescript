import { withOptional } from '@gyomu/schema'
import { buildExistingJsDoc } from './buildExistingJsDoc.js'
import type { FileAnalysisResult } from '../../analysis/file/FileAnalysisResult.js'
import type { ContextEntry } from '@gyomu/ai-compiler/jsdoc-update'
import type {
  DocumentableMemberAnalysis,
  MemberAnalysis,
  NonDocumentableMemberAnalysis,
  TypeStructureAnalysis,
} from '@gyomu/schema/typescript'

export const buildContextEntry = (
  fileResult: FileAnalysisResult,
  member: DocumentableMemberAnalysis | NonDocumentableMemberAnalysis,
): ContextEntry => {
  const jsDocAnalysis = member.documentable ? member.jsDoc : undefined
  // const hasJsDoc = jsDocAnalysis != undefined && jsDocAnalysis.exists

  const parsedJsDoc = fileResult.metadata.parsedJsDocs.get(JSON.stringify(member.identity))
  switch (member.kind) {
    case 'method':
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
            .map((m) => buildContextEntry(fileResult, m)),
        }),
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
        kind: member.kind,
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
            .map((m) => buildContextEntry(fileResult, m)),
        }),
      }
    }
  }
}
