import path from 'node:path'
import { PlatformLayer } from '@gyomu/infra'
import { Effect } from 'effect'
import { describe, expect, it } from 'vitest'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { createFixtureProject } from '../../../directory/__tests__/createFixtureProject.js'
import { buildPackageExportAnalysis } from '../buildPackageExportAnalysisResult.js'
import type { ResolvedSourceFile } from '../types.js'

const project = createFixtureProject(path.join('package-analysis'))
const buildExportResult = async (exportInfo: ResolvedSourceFile) => {
  return await Effect.runPromise(
    buildPackageExportAnalysis(exportInfo, project, {}).pipe(Effect.provide(PlatformLayer)),
  )
}
describe('buildPackageExportAnalysis', () => {
  it('analyzes a single source file', async () => {
    const result = await buildExportResult({
      exportPath: '.',
      sourceFiles: [ProjectRelativePath('src/schema.ts')],
    })

    expect(result.files).toHaveLength(1)
    expect(result.exports.exportPath).toBe('.')
    expect(result.exports.exportedSymbols.length).toBeGreaterThan(0)
  })

  it('collects exports from multiple source files', async () => {
    const result = await buildExportResult({
      exportPath: '.',
      sourceFiles: [ProjectRelativePath('src/schema.ts'), ProjectRelativePath('src/index.ts')],
    })

    const paths = result.files.map((f) => f.path)
    console.dir(paths)
    expect(result.files).toHaveLength(4)

    expect(paths).toContain('src/schema.ts')
    expect(paths).toContain('src/index.ts')
  })

  it('follows re-exported modules', async () => {
    const result = await buildExportResult({
      exportPath: '.',
      sourceFiles: [ProjectRelativePath('src/index.ts')],
    })

    const paths = result.files.map((f) => f.path)
    console.dir(paths)
    expect(paths).toContain('src/index.ts')
    expect(paths).toContain('src/schema.ts')
    expect(paths).toContain('src/usecase/createGreeting.ts')
  })

  it('returns the specified export path', async () => {
    const result = await buildExportResult({
      exportPath: './customer',
      sourceFiles: [ProjectRelativePath('src/gyomu/customer/index.ts')],
    })

    expect(result.exports.exportPath).toBe('./customer')
  })

  it('collects exported symbols', async () => {
    const result = await buildExportResult({
      exportPath: '.',
      sourceFiles: [ProjectRelativePath('src/index.ts')],
    })

    expect(result.exports.exportedSymbols.length).toBeGreaterThan(0)

    expect(result.exports.exportedSymbols.some((s) => s.name === 'createGreeting')).toBe(true)
  })
})
