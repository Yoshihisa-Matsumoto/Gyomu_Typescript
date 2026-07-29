import path from 'node:path'
import { Node } from 'ts-morph'
import { analyzeType } from '../analyzeType.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { ImportTypeNode, TypeNode } from 'ts-morph'
import type {
  MemberIdentityMemberPath,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'

/**
 * Analyzes an ImportTypeNode to resolve the module path and type arguments.
 *
 * @param args The analysis context for the TypeNode.
 *
 * @param newMemberPath The path of the member currently being analyzed.
 *
 * @param node The ImportTypeNode to analyze.
 *
 * @returns A result object containing the analyzed import structure, dependencies, and reserved names.
 */
export const analyzeImportTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: ImportTypeNode,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  const argumentsResult = node
    .getTypeArguments()
    .map((argument, index) =>
      analyzeType(
        { ...args, node: argument, declarationOrder: index, memberPath: [...newMemberPath, index] },
        undefined,
      ),
    )
  const argument = node.getArgument()
  let targetText = node.getText()
  if (Node.isLiteralTypeNode(argument)) {
    const literal = argument.getLiteral()
    if (Node.isStringLiteral(literal)) targetText = literal.getLiteralText()
  }

  return {
    member: {
      kind: 'import',
      moduleSpecifier: moduleSpecifierToSourcePath(targetText, args.sourceRelativePath),
      qualifier: node.getQualifier()?.getText(),
      typeArguments: argumentsResult.map((argument) => argument.member),
    },
    dependencies: [...argumentsResult.map((argument) => argument.dependencies).flat()],
    reservedNames: [],
  }
}

/**
 * Resolves a module specifier into a project-relative source path.
 *
 * @param moduleSpecifier The module specifier to resolve.
 *
 * @param sourceFilePath The path of the source file initiating the resolution.
 *
 * @returns The project-relative source path.
 */
export const moduleSpecifierToSourcePath = (
  moduleSpecifier: string,
  sourceFilePath: ProjectRelativePath,
): string => {
  const normalize = (p: string) => p.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '')
  const normalized = normalizeModuleSpecifier(moduleSpecifier)

  return normalize(path.join(path.dirname(sourceFilePath), normalized))
}

/**
 * Normalizes a module specifier to its source TypeScript file path.
 *
 * @example
 * './User.js'  -> './User.ts'
 * './User.mjs' -> './User.ts'
 * './User.cjs' -> './User.ts'
 *
 * @param moduleSpecifier The module specifier to normalize.
 *
 * @returns The normalized TypeScript source file path.
 */
export const normalizeModuleSpecifier = (moduleSpecifier: string): string => {
  return moduleSpecifier.replace(/\.(c|m)?js$/, '.ts')
}
