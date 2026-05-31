import { join } from 'node:path'
import { GyomuError, wrapInfraError } from '@gyomu/schema'
import { Effect, FileSystem } from 'effect'
import { readStringFromFile } from '@gyomu/infra/fs'
import { fromSync } from '@gyomu/schema/effect'
import { mapOutputPathToSourcePath } from '@gyomu/tsdoc'

export const parseProjectExports = (projectPath: string) => {
  return Effect.gen(function* () {
    const fileService = yield* FileSystem.FileSystem
    const projectExistence = yield* fileService.exists(projectPath).pipe(
      Effect.mapError((e) =>
        wrapInfraError(GyomuError, e, () => ({
          operation: 'file check',
          reason: 'unexpected' as const,
        })),
      ),
    )
    if (!projectExistence)
      return yield* Effect.fail(
        new GyomuError({
          cause: projectPath,
          domain: 'agent',
          message: `Project not exist: ${projectPath}`,
          operation: 'folder check',
          reason: 'not_found',
        }),
      )
    const packageJsonPath = join(projectPath, 'package.json')
    const tsconfigJsonPath = join(projectPath, 'tsconfig.json')

    const packageJsonExistence = yield* fileService.exists(packageJsonPath).pipe(
      Effect.mapError((e) =>
        wrapInfraError(GyomuError, e, () => ({
          operation: 'file check',
          reason: 'unexpected' as const,
        })),
      ),
    )
    if (!packageJsonExistence)
      return yield* Effect.fail(
        new GyomuError({
          cause: packageJsonPath,
          domain: 'agent',
          message: `package.json not exist: ${packageJsonPath}`,
          operation: 'file check',
          reason: 'not_found',
        }),
      )
    const tsconfigJsonExistence = yield* fileService.exists(tsconfigJsonPath).pipe(
      Effect.mapError((e) =>
        wrapInfraError(GyomuError, e, () => ({
          operation: 'file check',
          reason: 'unexpected' as const,
        })),
      ),
    )
    if (!tsconfigJsonExistence)
      return yield* Effect.fail(
        new GyomuError({
          cause: tsconfigJsonPath,
          domain: 'agent',
          message: `tsconfig.json not exist: ${tsconfigJsonPath}`,
          operation: 'file check',
          reason: 'not_found',
        }),
      )

    const packageJsonContent = yield* readStringFromFile(packageJsonPath).pipe(
      Effect.mapError((e) =>
        wrapInfraError(GyomuError, e, () => ({
          message: 'fail to read package.json',
          domain: 'agent',
          operation: 'read file',
        })),
      ),
    )
    const tsconfigJsonContent = yield* readStringFromFile(tsconfigJsonPath).pipe(
      Effect.mapError((e) =>
        wrapInfraError(GyomuError, e, () => ({
          message: 'fail to read tsconfig.json',
          domain: 'agent',
          operation: 'read file',
        })),
      ),
    )
    return yield* fromSync(GyomuError, (e) => ({
      domain: 'agent',
      operation: 'parse package.json/tsconfig.json',
      message: `Fail to parse file`,
      reason: 'invalid_input' as const,
    }))(() => {
      const packageJson = JSON.parse(packageJsonContent)
      const tsconfigJson = JSON.parse(tsconfigJsonContent)
      const rootDir = tsconfigJson.compilerOptions?.rootDir
      const outDir = tsconfigJson.compilerOptions?.outDir

      const exports: {
        [entry: string]: unknown
      } = packageJson.exports

      const exportPathArray: Array<string> = []
      for (const [entry, item] of Object.entries(exports)) {
        if (typeof item == 'string') {
          exportPathArray.push(
            mapOutputPathToSourcePath(item, { rootDir, outDir, cwd: projectPath }),
          )
        } else {
          const entries = item as { [entryType: string]: string }
          const importPath = entries.import
          if (!importPath) {
            throw new GyomuError({
              cause: entries,
              domain: 'agent',
              message: `entry is invalid`,
              operation: 'read package.json',
              reason: 'invalid_input',
            })
          }
          exportPathArray.push(
            mapOutputPathToSourcePath(importPath, { rootDir, outDir, cwd: projectPath }),
          )
        }
      }
      return exportPathArray
    })
  })
}
