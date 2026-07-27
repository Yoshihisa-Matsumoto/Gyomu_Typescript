import { Node } from 'ts-morph'
import { tracePlaceIdentity } from '../../trace/traceUtil.js'
import type { AnalysisOptions } from '@gyomu/schema'
import type { DependencyCandidate, ImportAnalysis } from '@gyomu/schema/schemas/typescript'
import type { MemberIdentityMemberPath } from '@gyomu/schema/typescript'
import type { TypeParameterDeclaration, TypeReferenceNode } from 'ts-morph'

/**
 * Analyzes a symbol's dependency, determining if it originates from an import or the local file.
 *
 * @param passedIdentity The symbol identifier to analyze.
 *
 * @param imported A list of known imports for checking binding origins.
 *
 * @param memberPath The path to the member within the identity structure.
 *
 * @returns Returns a DependencyCandidate describing the source and scope of the symbol.
 */
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

/**
 * Analyzes dependencies recursively from a TypeScript type reference node.
 *
 * @param typeRef The type reference node to analyze.
 *
 * @param reservedNames A list of names excluded from dependency analysis.
 *
 * @param options Optional configuration for the analysis.
 *
 * @returns An array of identified dependencies.
 */
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

/**
 * Analyzes dependencies declared within type parameters, including constraints.
 *
 * @param params The type parameters to analyze.
 *
 * @returns An array of identified dependencies.
 */
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
