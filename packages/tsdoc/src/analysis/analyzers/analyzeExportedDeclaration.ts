import { Node } from 'ts-morph'
import { withOptional } from '@gyomu/schema'
import { analyzeClassDeclaration } from './symbol/class/analyzeClass.js'
import { analyzeFunctionDeclaration } from './symbol/analyzeFunction.js'
import { analyzeInterfaceDeclaration } from './symbol/analyzeInterface.js'
import { analyzeEnumDeclaration } from './symbol/analyzeEnum.js'
import { analyzeVariableDeclaration } from './symbol/variable/analyzeVariable.js'
import { analyzeTypeAliasDeclaration } from './symbol/analyzeTypeAlias.js'
import type { ExportAnalysis } from '../symbol/ExportAnalysis.js'
import type { ExportedDeclarations } from 'ts-morph'
import type { AnalysisOptions } from '../AnalysisOption.js'
import type { ProjectRelativePath } from '../types.js'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'

export const analyzeExportedDeclaration = (
  name: string,
  declaration: ExportedDeclarations,
  sourceRelativePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  sourceFullText: string,
  options?: AnalysisOptions,
): ExportAnalysis | undefined => {
  const memberPath: Array<string> = []
  if (Node.isClassDeclaration(declaration)) {
    const classResult = analyzeClassDeclaration(
      withOptional({
        declaration,
        options,
        sourceRelativePath,
        metadata,
        memberPath,
        sourceFullText,
      }),
    )
    return {
      exportedName: name,
      isTypeOnly: false,
      ...classResult,
    }
  }
  if (Node.isFunctionDeclaration(declaration)) {
    const functionResult = analyzeFunctionDeclaration(
      withOptional({
        declaration,
        options,
        sourceRelativePath,
        metadata,
        memberPath,
        sourceFullText,
      }),
    )
    return {
      ...functionResult,
      isTypeOnly: false,
      exportedName: name,
    }
  }
  if (Node.isInterfaceDeclaration(declaration)) {
    const interfaceResult = analyzeInterfaceDeclaration(
      withOptional({
        declaration,
        options,
        sourceRelativePath,
        metadata,
        memberPath,
        sourceFullText,
      }),
    )
    return {
      ...interfaceResult,
      isTypeOnly: true,
      exportedName: name,
    }
  }
  if (Node.isEnumDeclaration(declaration)) {
    const enumResult = analyzeEnumDeclaration(
      withOptional({
        declaration,
        options,
        sourceRelativePath,
        metadata,
        memberPath,
        sourceFullText,
      }),
    )
    return {
      ...enumResult,
      isTypeOnly: false,
      exportedName: name,
    }
  }
  if (Node.isVariableDeclaration(declaration)) {
    const variableresult = analyzeVariableDeclaration(
      withOptional({
        declaration,
        options,
        sourceRelativePath,
        metadata,
        memberPath,
        sourceFullText,
      }),
    )
    return {
      ...variableresult,
      exportedName: name,
      isTypeOnly: false,
    }
  }
  if (Node.isTypeAliasDeclaration(declaration)) {
    const typeResult = analyzeTypeAliasDeclaration(
      withOptional({
        declaration,
        options,
        sourceRelativePath,
        metadata,
        memberPath,
        sourceFullText,
      }),
    )
    return {
      ...typeResult,
      isTypeOnly: true,
    }
  }

  // if (Node.isModuleDeclaration(declaration)) {
  //   const moduleResult = analyzeModuleDeclaration(withOptional({ declaration, options }))
  //   return {
  //     ...moduleResult,
  //     exportedName: name,
  //     isTypeOnly: true,
  //   }
  // }
  return undefined
}
