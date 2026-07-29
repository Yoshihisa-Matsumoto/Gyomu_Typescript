import { SymbolId } from '@gyomu/schema/typescript'
import { createQualifiedName } from './createQualifiedName.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

import type { Node } from 'ts-morph'
import type { SymbolIDComposite } from '../symbol/SymbolIdComposite.js'

/**
 * Creates a unique identifier for a symbol based on its source path, qualified name, and signature.
 *
 * @param node The AST node representing the symbol.
 *
 * @param sourceRelativePath The relative path to the file containing the symbol.
 *
 * @param signatureId A unique identifier for the symbol signature.
 *
 * @returns An object containing the unique symbol ID and its qualified name.
 */
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
