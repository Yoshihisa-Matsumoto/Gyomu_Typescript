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
import type {
  DocumentablePropertyMemberAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/schemas/typescript'

const timeout = 20000

const enumFixture = createFixtureProject(path.join('analysis', 'enum'))

const enumAnalysisProgram = async (sourceFile: string): Promise<ReadonlyArray<SymbolAnalysis>> => {
  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const fileResult = yield* analyzeFile(enumFixture, filePath, { verifyIndex: true })

      yield* saveFileAnalysis(enumFixture, fileResult.analysis).pipe(
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

      const loaded = yield* loadFileAnalysis(enumFixture, fileResult.analysis.path).pipe(
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
      return fileResult.analysis.symbols
    }).pipe(Effect.provide(PlatformLayer)),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}

const getEnum = (symbols: ReadonlyArray<SymbolAnalysis>, name: string): SymbolAnalysis => {
  const targetSymbol = symbols.find((symbol) => symbol.identity.symbolId == name)
  expect(targetSymbol).toBeDefined()
  if (!targetSymbol) throw new Error(`${name} Not Found`)
  return targetSymbol
}
const getEnumMember = (
  symbol: SymbolAnalysis,
  name: string,
): DocumentablePropertyMemberAnalysis => {
  const targetMember = symbol.members.find((m) => m.name == name)
  expect(targetMember).toBeDefined()
  if (!targetMember) throw new Error(`${name} Not Found`)
  if (targetMember.kind != 'property' || targetMember.documentable == false)
    throw new Error(`${name} must be documentable property`)
  return targetMember
}
const getEnumMeberAsTypeStructure = (symbol: SymbolAnalysis, name: string) => {
  const property = getEnumMember(symbol, name)
  const structure = property.type?.structure
  if (!structure) throw new Error(`${name} must have type structure`)
  return structure
}
const getEnumMemberAsLiteral = (symbol: SymbolAnalysis, name: string) => {
  const structure = getEnumMeberAsTypeStructure(symbol, name)

  if (structure.kind != 'literal') throw new Error(`${name} must be literal`)
  return structure
}

describe('analyze Enum pattern', () => {
  it(
    '01-basic-enum.ts',
    async () => {
      const result = await enumAnalysisProgram('01-basic-enum.ts')

      console.dir(result, { depth: null })
      const direction = getEnum(result, 'Direction')
      expect(direction.members.length).toBe(4)
      const color = getEnum(result, 'Color')
      expect(color.members.length).toBe(3)
      const blue = getEnumMemberAsLiteral(color, 'Blue')

      expect(blue.elementValue).toBe(3)

      const status = getEnum(result, 'Status')
      expect(status).toBeDefined()
      expect(status.members.length).toBe(3)
    },
    timeout,
  )
  it(
    '02-const-enum.ts',
    async () => {
      const result = await enumAnalysisProgram('02-const-enum.ts')

      console.dir(result, { depth: null })

      const tokenKind = getEnum(result, 'TokenKind')
      const NumberField = getEnumMeberAsTypeStructure(tokenKind, 'Number')
      expect(NumberField.kind).toBe('literal')
      if (NumberField.kind == 'literal') expect(NumberField.elementValue).toBe(1)

      const flags = getEnum(result, 'Flags')
      const execute = getEnumMemberAsLiteral(flags, 'Execute')
      expect(execute.elementValue).toBe(4)
    },
    timeout,
  )
  it(
    '03-computed-enum.ts',
    async () => {
      const result = await enumAnalysisProgram('03-computed-enum.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '04-ambient-enum.ts',
    async () => {
      const result = await enumAnalysisProgram('04-ambient-enum.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '05-merge-enum.ts',
    async () => {
      const result = await enumAnalysisProgram('05-merge-enum.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '06-enum-usage.ts',
    async () => {
      const result = await enumAnalysisProgram('06-enum-usage.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
})
