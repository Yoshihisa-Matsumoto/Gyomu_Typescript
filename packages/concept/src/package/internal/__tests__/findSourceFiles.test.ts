import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { Effect } from 'effect'
import { FileSearchServiceLayer } from '@gyomu/infra/fs'
import { PlatformLayer } from '@gyomu/infra'
import { FullPath } from '@gyomu/schema'
import { findSourceFiles } from '../findSourceFiles.js'
import type { ResolvedPackageExport } from '../types.js'

const findSourceFilesTest = async (resolvedExportPath: ResolvedPackageExport) => {
  const fixtureRoot = FullPath(resolve('./test-fixtures/package-analysis'))
  return await Effect.runPromise(
    findSourceFiles(fixtureRoot, resolvedExportPath).pipe(
      Effect.provide(PlatformLayer),
      Effect.provide(FileSearchServiceLayer),
    ),
  )
}
describe('findSourceFiles', () => {
  it('finds a single source file', async () => {
    const result = await findSourceFilesTest({
      exportPath: '.',
      sourceFile: ProjectRelativePath('src/index.ts'),
    })
    expect(result).toEqual({
      exportPath: '.',
      sourceFiles: [ProjectRelativePath('src/index.ts')],
    })
  })

  it('finds wildcard source files', async () => {
    const result = await findSourceFilesTest({
      exportPath: './usecase',
      sourceFile: ProjectRelativePath('src/usecase/*.ts'),
    })

    expect(result.sourceFiles).toEqual(
      expect.arrayContaining([
        ProjectRelativePath('src/usecase/createGreeting.ts'),
        ProjectRelativePath('src/usecase/updateGreeting.ts'),
      ]),
    )
  })
  it('finds nested index files', async () => {
    const result = await findSourceFilesTest({
      exportPath: './gyomu',
      sourceFile: ProjectRelativePath('src/gyomu/*/index.ts'),
    })

    expect(result.sourceFiles).toEqual(
      expect.arrayContaining([
        ProjectRelativePath('src/gyomu/admin/user/index.ts'),
        ProjectRelativePath('src/gyomu/customer/index.ts'),
        ProjectRelativePath('src/gyomu/order/index.ts'),
      ]),
    )
  })

  it('returns empty when no file matches', async () => {
    const result = await findSourceFilesTest({
      exportPath: './gyomu',
      sourceFile: ProjectRelativePath('src/abc/*/index.ts'),
    })

    expect(result.sourceFiles).toEqual([])
  })
})
