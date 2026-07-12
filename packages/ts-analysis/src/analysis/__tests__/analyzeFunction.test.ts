import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { flattenIssues } from '@gyomu/schema/entity'
import { PlatformLayer } from '@gyomu/infra'
import { analyzeFile } from '../analyzeFile.js'
import { saveFileAnalysis } from '../saveFileAnalysis.js'
import { loadFileAnalysis } from '../loadFileAnalysis.js'
import { createFixtureProject } from './createFixtureProject.js'
import type { SymbolAnalysis } from '@gyomu/schema/schemas/typescript'

const timeout = 20000

const functionFixture = createFixtureProject(path.join('analysis', 'function'))

const functionAnalysisProgram = async (sourceFile: string): Promise<SymbolAnalysis> => {
  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const fileResult = yield* analyzeFile(functionFixture, filePath, { verifyIndex: true })
      yield* saveFileAnalysis(functionFixture, fileResult.analysis).pipe(
        Effect.catch((e) => {
          if (e._tag == '@gyomu/schema/SchemaErrorContext') {
            if (e.issues) {
              const issue = flattenIssues(e.issues)
              // fs.writeFileSync(path.join('log', 'SaveError.txt'), JSON.stringify(issue, null, 2))
              console.log('Save')
              console.dir(issue, { depth: null })
            }
          }

          return Effect.fail(e)
        }),
      )

      const loaded = yield* loadFileAnalysis(functionFixture, fileResult.analysis.path).pipe(
        Effect.catch((e) => {
          if (e._tag == '@gyomu/agent/tsdoc/AnalysisError') {
            const error = e.cause as object
            if ('issues' in error) {
              if (error.issues) {
                const issue = flattenIssues(error.issues as any)
                console.dir(issue, { depth: null })
              }
            }
          }

          return Effect.fail(e)
        }),
      )

      expect(loaded).toEqual(fileResult.analysis)
      return fileResult.analysis.symbols[0]
    }).pipe(Effect.provide(PlatformLayer)),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}

const functionSymbolsDependencyProgram = async (sourceFile: string, folder?: string) => {
  const sourcePath = folder ? path.join('src', folder, sourceFile) : path.join('src', sourceFile)
  const filePath = ProjectRelativePath(sourcePath)
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const fileResult = yield* analyzeFile(functionFixture, filePath, { verifyIndex: true })
      yield* saveFileAnalysis(functionFixture, fileResult.analysis).pipe(
        Effect.catch((e) => {
          if (e._tag == '@gyomu/schema/SchemaErrorContext') {
            if (e.issues) {
              const issue = flattenIssues(e.issues)
              // fs.writeFileSync(path.join('log', 'SaveError.txt'), JSON.stringify(issue, null, 2))
              console.log('Save')
              console.dir(issue, { depth: null })
            }
          }

          return Effect.fail(e)
        }),
      )

      const loaded = yield* loadFileAnalysis(functionFixture, fileResult.analysis.path).pipe(
        Effect.catch((e) => {
          if (e._tag == '@gyomu/agent/tsdoc/AnalysisError') {
            const error = e.cause as object
            if ('issues' in error) {
              if (error.issues) {
                const issue = flattenIssues(error.issues as any)
                console.dir(issue, { depth: null })
              }
            }
          }

          return Effect.fail(e)
        }),
      )

      expect(loaded).toEqual(fileResult.analysis)

      const exports = fileResult.analysis.symbols.map((s) => {
        return {
          name: s.identity.symbolId,
          dependencies: s.dependencyCandidates,
        }
      })
      return exports
    }).pipe(Effect.provide(PlatformLayer)),
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
