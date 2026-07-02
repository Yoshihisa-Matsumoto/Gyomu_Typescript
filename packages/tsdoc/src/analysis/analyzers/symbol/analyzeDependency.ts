import { Node } from 'ts-morph'
import type {
  DependencyRequirement,
  ImportAnalysis,
  MemberIdentityMemberPath,
} from '@gyomu/schema/typescript'
import type { TypeParameterDeclaration, TypeReferenceNode } from 'ts-morph'

export const analyzeDependency = (
  identity: string,
  imported: Array<ImportAnalysis>,
  memberPath: MemberIdentityMemberPath,
): DependencyRequirement => {
  if (!hasImportedBinding(identity, imported)) {
    return {
      source: { memberPath },
      target: {
        scope: 'local-file',
        symbolName: identity,
      },
    }
  } else {
    return {
      source: { memberPath },
      target: {
        scope: 'import',
        localName: identity,
      },
    }
  }
}

const reservedTypeNames = [
  'Promise',
  'Array',
  'Map',
  'Set',
  'Record',
  'string',
  'number',
  'boolean',
  'any',
  'unknown',
  'void',
  'never',
  'object',
  'undefined',
  'null',
  'bigint',
]
export const analyzeDependencyFromTypeReference = (
  typeRef: TypeReferenceNode,
  imported: Array<ImportAnalysis>,
  memberPath: MemberIdentityMemberPath,
  reservedNames: Array<string>,
): Array<DependencyRequirement> => {
  // Name, TypeArguments
  const typeName = typeRef.getTypeName().getText()
  const dependencies: Array<DependencyRequirement> = []

  if (!reservedTypeNames.includes(typeName) && !reservedNames.includes(typeName)) {
    dependencies.push(analyzeDependency(typeName, imported, memberPath))
  }
  const typeArgs = typeRef.getTypeArguments()
  typeArgs.forEach((arg, index) => {
    const newMemberPath = [...memberPath, '$generics', index]
    if (Node.isTypeReference(arg)) {
      dependencies.push(
        ...analyzeDependencyFromTypeReference(arg, imported, newMemberPath, reservedNames),
      )
    } else {
      const typeArgText = arg.getText()
      if (!reservedTypeNames.includes(typeArgText) && !reservedNames.includes(typeArgText)) {
        dependencies.push(analyzeDependency(typeArgText, imported, newMemberPath))
      }
    }
  })
  return dependencies
}

export const analyzeDependencyFromTypeParameters = (
  params: Array<TypeParameterDeclaration>,
  imported: Array<ImportAnalysis>,
  memberPath: MemberIdentityMemberPath,
  reservedNames: Array<string>,
): Array<DependencyRequirement> => {
  const dependencies: Array<DependencyRequirement> = []

  params.forEach((param) => {
    const name = param.getName()
    const newMemberPath = [...memberPath, '$generics', name]
    console.log(`memberPath: ${newMemberPath.join('.')}`)
    const constraint = param.getConstraint()
    console.log(`constraint: ${constraint?.getText()}`)
    if (constraint && Node.isTypeReference(constraint)) {
      dependencies.push(
        ...analyzeDependencyFromTypeReference(constraint, imported, newMemberPath, reservedNames),
      )
    }
  })
  return dependencies
}

const hasImportedBinding = (identity: string, imported: Array<ImportAnalysis>): boolean => {
  return !!imported.find((i) => i.localName == identity)
}
