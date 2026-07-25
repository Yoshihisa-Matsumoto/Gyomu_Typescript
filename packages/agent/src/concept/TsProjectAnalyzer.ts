import { join, resolve } from 'node:path'
import { Project } from 'ts-morph'
import { initLoggerFromEnv } from '@gyomu/infra'

/**
 * Analyzes a TypeScript project at a given path to extract module import and export relationships for specified root paths.
 *
 * @param projectPath The filesystem path to the project root directory containing the tsconfig.json.
 *
 * @param exportRootPathEntries A list of relative paths within the project to analyze for imports and exports.
 */
export const analyzeTsProject = (projectPath: string, exportRootPathEntries: Array<string>) => {
  const project = new Project({
    tsConfigFilePath: join(projectPath, 'tsconfig.json'),
  })
  const srcPath = project.compilerOptions.get().rootDir

  for (const exportRoot of exportRootPathEntries) {
    const sourceFile = project.getSourceFile(resolve(projectPath, exportRoot))
    if (!sourceFile) {
      console.log(`${exportRoot} not found`)
      continue
    }
    for (const declaration of sourceFile.getImportDeclarations()) {
      const importedFile = declaration.getModuleSpecifierSourceFile()
      if (!importedFile) continue
      console.log(importedFile.getFilePath())
    }
    for (const declaration of sourceFile.getExportDeclarations()) {
      const exportedFile = declaration.getModuleSpecifierSourceFile()
      if (!exportedFile) continue
      console.log(exportedFile.getFilePath())
    }
  }
}
process.loadEnvFile('./.env')
await initLoggerFromEnv()
analyzeTsProject('C:\\data\\program\\typescript\\dev\\gyomu\\packages\\approval-core', [
  './src/index.ts',
])
