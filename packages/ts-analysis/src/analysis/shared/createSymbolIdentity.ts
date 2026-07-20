import { SymbolId } from '@gyomu/schema/typescript'
import { createQualifiedName } from './createQualifiedName.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

import type { Node } from 'ts-morph'
import type { SymbolIDComposite } from '../symbol/SymbolIdComposite.js'

export const createSymbolIdentity = (
  node: Node,
  sourceRelativePath: ProjectRelativePath,
  signatureId: string,
): SymbolIDComposite => {
  const qualifiedName = createQualifiedName(node)

  return {
    id: SymbolId(`${sourceRelativePath}::${qualifiedName}::${signatureId}`),
    qualifiedName,
  }
}
