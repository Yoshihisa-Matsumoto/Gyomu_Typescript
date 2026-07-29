import { Node } from 'ts-morph'

/**
 * Creates a qualified name string by traversing up the AST to collect naming identifiers from parent declarations.
 *
 * @param node The starting node to traverse from.
 *
 * @returns A dot-separated string representation of the qualified name.
 */
export const createQualifiedName = (node: Node): string => {
  const names: Array<string> = []

  let current: Node | undefined = node

  while (current != null) {
    if (
      Node.isClassDeclaration(current) ||
      Node.isInterfaceDeclaration(current) ||
      Node.isEnumDeclaration(current) ||
      Node.isModuleDeclaration(current) ||
      Node.isFunctionDeclaration(current) ||
      Node.isMethodDeclaration(current) ||
      Node.isPropertyDeclaration(current) ||
      Node.isTypeAliasDeclaration(current) ||
      Node.isVariableDeclaration(current) ||
      Node.isMethodDeclaration(current) ||
      Node.isMethodSignature(current)
    ) {
      const name = current.getName()

      if (name != null && name.length > 0) {
        names.unshift(name)
      }
    }

    current = current.getParent()
  }

  return names.join('.')
}
