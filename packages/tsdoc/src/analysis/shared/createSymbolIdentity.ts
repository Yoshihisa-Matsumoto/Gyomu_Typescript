import { createQualifiedName } from './createQualifiedName.js'

import type { Node } from 'ts-morph'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { SymbolIDComposite } from '../symbol/SymbolIdComposite.js'

export const createSymbolIdentity = (
  node: Node,
  sourceRelativePath: ProjectRelativePath,
  signatureId: string,
): SymbolIDComposite => {
  const qualifiedName = createQualifiedName(node)

  return {
    id: `${sourceRelativePath}::${qualifiedName}::${signatureId}`,
    qualifiedName,
  }
}
