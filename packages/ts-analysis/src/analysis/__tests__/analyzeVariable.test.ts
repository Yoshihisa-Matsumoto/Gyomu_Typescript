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
import type { DependencyCandidate } from '@gyomu/schema/schemas/typescript'

const timeout = 20000

const variableFixture = createFixtureProject(path.join('analysis', 'variable'))

const variableAnalysisProgram = async (
  sourceFile: string,
): Promise<ReadonlyArray<DependencyCandidate>> => {
  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const fileResult = yield* analyzeFile(variableFixture, filePath, { verifyIndex: true })

      yield* saveFileAnalysis(variableFixture, fileResult.analysis).pipe(
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

      const loaded = yield* loadFileAnalysis(variableFixture, fileResult.analysis.path).pipe(
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
      return fileResult.analysis.symbols.map((s) => s.dependencyCandidates).flat()
    }).pipe(Effect.provide(PlatformLayer)),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}

describe('analyze variable dependency pattern', () => {
  it('01-arrow-function.ts', async () => {
    const result = await variableAnalysisProgram('01-arrow-function.ts')
    // console.dir(result, { depth: null })
    expect(result).toEqual(
      expect.arrayContaining([
        {
          source: { memberPath: ['$body'] },
          target: { scope: 'local-file', localSymbolName: 'name' },
        },
        {
          source: { memberPath: ['$body'] },
          target: { scope: 'import', localSymbolName: 'createGreeting' },
        },
      ]),
    )
  })
})
