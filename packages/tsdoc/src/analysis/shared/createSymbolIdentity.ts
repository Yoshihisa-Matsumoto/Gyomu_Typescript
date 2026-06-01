import { createQualifiedName } from './createQualifiedName.js'

import type { Node } from 'ts-morph'
import type { SymbolIdentity } from '../symbol/SymbolAnalysis.js'
import type { ProjectRelativePath } from '../types.js'

export const createSymbolIdentity = (
  node: Node,
  sourceRelativePath: ProjectRelativePath,
  signatureId: string,
): SymbolIdentity => {
  const qualifiedName = createQualifiedName(node)

  return {
    id: `${sourceRelativePath}::${qualifiedName}::${signatureId}`,
    qualifiedName,
  }
}
