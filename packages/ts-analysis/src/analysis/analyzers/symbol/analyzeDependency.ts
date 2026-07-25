import { Node } from 'ts-morph'
import { tracePlaceIdentity } from '../../trace/traceUtil.js'
import type { AnalysisOptions } from '@gyomu/schema'
import type { DependencyCandidate, ImportAnalysis } from '@gyomu/schema/schemas/typescript'
import type { MemberIdentityMemberPath } from '@gyomu/schema/typescript'
import type { TypeParameterDeclaration, TypeReferenceNode } from 'ts-morph'

export const analyzeDependency = (
  passedIdentity: string,
  imported: Array<ImportAnalysis>,
  memberPath: MemberIdentityMemberPath,
): DependencyCandidate => {
  let identity = passedIdentity
  if (identity.includes('.')) identity = identity.split('.')[0]!

  if (!hasImportedBinding(identity, imported)) {
    return {
      source: { memberPath },
      target: {
        scope: 'local-file',
        localSymbolName: identity,
      },
    }
  } else {
    return {
      source: { memberPath },
      target: {
        scope: 'import',
        localSymbolName: identity,
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
  options: AnalysisOptions | undefined,
): Array<DependencyCandidate> => {
  // Name, TypeArguments
  const typeName = typeRef.getTypeName().getText()
  const dependencies: Array<DependencyCandidate> = []
  tracePlaceIdentity(typeRef, options)
  if (!reservedTypeNames.includes(typeName) && !reservedNames.includes(typeName)) {
    dependencies.push(analyzeDependency(typeName, imported, memberPath))
  }
  const typeArgs = typeRef.getTypeArguments()
  typeArgs.forEach((arg, index) => {
    const newMemberPath = [...memberPath, '$generics', index]
    if (Node.isTypeReference(arg)) {
      dependencies.push(
        ...analyzeDependencyFromTypeReference(arg, imported, newMemberPath, reservedNames, options),
      )
    } else {
      const typeArgText = arg.getText()
      tracePlaceIdentity(
        typeRef,
        options,
        'analyzeDependencyFromTypeReference:analyzeDependency:' + typeArgText,
      )
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
  options: AnalysisOptions | undefined,
): Array<DependencyCandidate> => {
  const dependencies: Array<DependencyCandidate> = []

  params.forEach((param) => {
    const name = param.getName()
    const newMemberPath = [...memberPath, '$generics', name]
    // console.log(`memberPath: ${newMemberPath.join('.')}`)
    const constraint = param.getConstraint()
    // console.log(`constraint: ${constraint?.getText()}`)
    if (constraint && Node.isTypeReference(constraint)) {
      dependencies.push(
        ...analyzeDependencyFromTypeReference(
          constraint,
          imported,
          newMemberPath,
          reservedNames,
          options,
        ),
      )
    }
  })
  return dependencies
}

const hasImportedBinding = (identity: string, imported: Array<ImportAnalysis>): boolean => {
  return !!imported.find((i) => i.localName == identity)
}
