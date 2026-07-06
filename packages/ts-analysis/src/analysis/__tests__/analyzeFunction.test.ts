import path from 'node:path'
import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { analyzeFile } from '../analyzeFile.js'
import { createFixtureProject } from './createFixtureProject.js'
import type { SymbolAnalysis } from '@gyomu/schema/schemas/typescript'

const timeout = 20000

const functionFixture = createFixtureProject(path.join('analysis', 'function'))

const functionAnalysisProgram = (sourceFile: string): SymbolAnalysis => {
  const { project, projectRoot, projectName } = functionFixture

  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(functionFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(Effect.map((result) => result.analysis.symbols[0]))
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}

const functionSymbolsDependencyProgram = (sourceFile: string, folder?: string) => {
  const { project, projectRoot, projectName } = functionFixture

  const sourcePath = folder ? path.join('src', folder, sourceFile) : path.join('src', sourceFile)
  const filePath = ProjectRelativePath(sourcePath)
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(functionFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(
        Effect.map((result) => {
          if (!fs.existsSync('./log')) fs.mkdirSync('./log')
          fs.writeFileSync('./log/fileAnalysis.txt', JSON.stringify(result.analysis, null, 2))
          const exports = result.analysis.symbols.map((s) => {
            return {
              name: s.identity.symbolId,
              dependencies: s.dependencyCandidates,
            }
          })
          return exports
        }),
      )
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}

describe('analyze Function pattern', () => {
  it(
    '01-function-effect.ts',
    async () => {
      const result = await functionAnalysisProgram('01-function-effect.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
})
describe('analyze Function dependency pattern', () => {
  it(
    '01-function-dependency.ts',
    async () => {
      const result = await functionSymbolsDependencyProgram(
        '01-function-dependency.ts',
        'dependency',
      )
      const dependencies = result.find((s) => s.name === 'dependencyFunction')

      console.dir(result, { depth: null })
      expect(dependencies).toBeDefined()
      expect(dependencies?.dependencies).toEqual(
        expect.arrayContaining([
          {
            source: { memberPath: ['$generics', 'T'] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$generics', 'U'] },
            target: { scope: 'local-file', localSymbolName: 'LocalClass' },
          },
          {
            source: { memberPath: ['local'] },
            target: { scope: 'local-file', localSymbolName: 'LocalType' },
          },
          {
            source: { memberPath: ['imported'] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$body'] },
            target: { scope: 'local-file', localSymbolName: 'localFunction' },
          },
          {
            source: { memberPath: ['$body'] },
            target: { scope: 'import', localSymbolName: 'importedFunction' },
          },
          {
            source: { memberPath: ['$body'] },
            target: { scope: 'local-file', localSymbolName: 'LocalClass' },
          },
          {
            source: { memberPath: ['$body'] },
            target: { scope: 'import', localSymbolName: 'ImportedClass' },
          },
          {
            source: { memberPath: ['$return'] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
        ]),
      )
    },
    timeout,
  )
})
