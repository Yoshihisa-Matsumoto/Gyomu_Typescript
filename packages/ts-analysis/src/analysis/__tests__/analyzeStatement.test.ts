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
  DocumentableMethodMemberAnalysis,
  FunctionBodyAnalysis,
  NonDocumentableMethodMemberAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/schemas/typescript'

const timeout = 20000

const enumFixture = createFixtureProject(path.join('analysis', 'statement'))

const statementAnalysisProgram = async (
  sourceFile: string,
  parent?: string,
): Promise<ReadonlyArray<SymbolAnalysis>> => {
  const filePath = ProjectRelativePath(
    parent ? path.join('src', parent, sourceFile) : path.join('src', sourceFile),
  )
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const fileResult = yield* analyzeFile(enumFixture, filePath, {
        debugInfo: { verifyIndex: true },
      })

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

const getFunction = (
  symbols: ReadonlyArray<SymbolAnalysis>,
  symbolNameLike: string,
): FunctionBodyAnalysis => {
  return symbols.find((s) => s.id.includes(symbolNameLike))!.functionBody!
}

const getClassMethod = (
  symbols: ReadonlyArray<SymbolAnalysis>,
  classNameLike: string,
  methodName: string,
): FunctionBodyAnalysis => {
  const classMethod = symbols
    .find((s) => s.id.includes(classNameLike))!
    .members.find((m) => m.name == methodName && m.kind == 'method') as
    NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis
  return classMethod.functionBody!
}
describe('analyze Statement pattern', () => {
  describe('call', () => {
    it(
      '01-identifier.ts',
      async () => {
        const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
        console.log(`Filename: ${fileName}`)
        const result = await statementAnalysisProgram(fileName, 'call')

        const target = getFunction(result, 'Identifier')
        // console.dir(target, { depth: null })
        expect(target.elements.filter((e) => e.kind == 'call')).toEqual(
          expect.arrayContaining([
            {
              kind: 'call',
              callee: { kind: 'identifier', name: 'foo' },
              arguments: [],
              optional: false,
            },
            {
              kind: 'call',
              callee: { kind: 'identifier', name: 'foo' },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
            {
              kind: 'call',
              callee: { kind: 'identifier', name: 'foo2' },
              arguments: [
                { kind: 'identifier', name: 'value' },
                { kind: 'string-literal', value: 'test' },
              ],
              optional: false,
            },
            {
              kind: 'call',
              callee: { kind: 'identifier', name: 'functionValue' },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
          ]),
        )
      },
      timeout,
    )
    it(
      '02-property-access.ts',
      async () => {
        const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
        console.log(`Filename: ${fileName}`)
        const result = await statementAnalysisProgram(fileName, 'call')

        const target = getFunction(result, 'PropertyAccess')
        // console.dir(target, { depth: null })
        expect(target.elements.filter((e) => e.kind == 'call')).toEqual(
          expect.arrayContaining([
            {
              kind: 'call',
              callee: {
                kind: 'property-access',
                object: { kind: 'identifier', name: 'obj' },
                optional: false,
                property: 'foo',
              },
              arguments: [],
              optional: false,
            },
            {
              kind: 'call',
              callee: {
                kind: 'property-access',
                object: { kind: 'identifier', name: 'obj' },
                optional: false,
                property: 'foo',
              },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
            {
              kind: 'call',
              callee: {
                kind: 'property-access',
                object: {
                  kind: 'property-access',
                  object: { kind: 'identifier', name: 'obj' },
                  optional: false,
                  property: 'nested',
                },
                optional: false,
                property: 'execute',
              },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
            {
              kind: 'call',
              callee: {
                kind: 'property-access',
                object: { kind: 'identifier', name: 'methodObject' },
                optional: false,
                property: 'execute',
              },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
          ]),
        )
      },
      timeout,
    )
    it(
      '03-computed-access.ts',
      async () => {
        const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
        console.log(`Filename: ${fileName}`)
        const result = await statementAnalysisProgram(fileName, 'call')

        const target = getFunction(result, 'ComputedFunction')
        // console.dir(target, { depth: null })
        expect(target.elements.filter((e) => e.kind == 'call')).toEqual(
          expect.arrayContaining([
            {
              kind: 'call',
              callee: {
                kind: 'computed-access',
                object: { kind: 'identifier', name: 'methodObject' },
                optional: false,
                index: { kind: 'identifier', name: 'method' },
              },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
            {
              kind: 'call',
              callee: {
                kind: 'computed-access',
                object: { kind: 'identifier', name: 'methodObject' },
                optional: false,
                index: { kind: 'identifier', name: 'method' },
              },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
            {
              kind: 'call',
              callee: {
                kind: 'computed-access',
                object: { kind: 'identifier', name: 'methodObject' },
                optional: false,
                index: { kind: 'string-literal', value: 'execute' },
              },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
            {
              kind: 'call',
              callee: {
                kind: 'computed-access',
                object: { kind: 'identifier', name: 'methodObject' },
                optional: false,
                index: {
                  kind: 'call',
                  callee: { kind: 'identifier', name: 'getMethod' },
                  arguments: [],
                  optional: false,
                },
              },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
          ]),
        )
      },
      timeout,
    )
    it(
      '04-this.ts',
      async () => {
        const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
        console.log(`Filename: ${fileName}`)
        const result = await statementAnalysisProgram(fileName, 'call')

        const target = getClassMethod(result, 'ChildClass', 'execute')
        console.dir(target, { depth: null })
        expect(target.elements.filter((e) => e.kind == 'call')).toEqual(
          expect.arrayContaining([
            {
              kind: 'call',
              callee: {
                kind: 'property-access',
                object: { kind: 'this' },
                optional: false,
                property: 'childMethod',
              },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
          ]),
        )
      },
      timeout,
    )
    it(
      '05-super.ts',
      async () => {
        const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
        console.log(`Filename: ${fileName}`)
        const result = await statementAnalysisProgram(fileName, 'call')

        const target = getClassMethod(result, 'ChildClass', 'execute')
        // console.dir(target, { depth: null })
        expect(target.elements.filter((e) => e.kind == 'call')).toEqual(
          expect.arrayContaining([
            {
              kind: 'call',
              callee: {
                kind: 'property-access',
                object: { kind: 'super' },
                optional: false,
                property: 'baseMethod',
              },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
          ]),
        )
      },
      timeout,
    )
    it(
      '06-optional.ts',
      async () => {
        const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
        console.log(`Filename: ${fileName}`)
        const result = await statementAnalysisProgram(fileName, 'call')

        const target = getFunction(result, 'OptionalCall')
        // console.dir(target, { depth: null })
        expect(target.elements.filter((e) => e.kind == 'call')).toEqual(
          expect.arrayContaining([
            {
              kind: 'call',
              callee: { kind: 'identifier', name: 'foo' },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: true,
            },
            {
              kind: 'call',
              callee: {
                kind: 'property-access',
                object: { kind: 'identifier', name: 'obj' },
                optional: true,
                property: 'foo',
              },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
          ]),
        )
      },
      timeout,
    )
    it(
      '07-nested.ts',
      async () => {
        const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
        console.log(`Filename: ${fileName}`)
        const result = await statementAnalysisProgram(fileName, 'call')

        const target = getFunction(result, 'NestedCall')
        console.dir(target, { depth: null })
        expect(target.elements.filter((e) => e.kind == 'call')).toEqual(
          expect.arrayContaining([
            {
              kind: 'call',
              callee: { kind: 'identifier', name: 'foo' },
              arguments: [
                {
                  kind: 'call',
                  callee: { kind: 'identifier', name: 'bar' },
                  arguments: [{ kind: 'identifier', name: 'value' }],
                  optional: false,
                },
              ],
              optional: false,
            },
            {
              kind: 'call',
              callee: { kind: 'identifier', name: 'foo' },
              arguments: [
                {
                  kind: 'call',
                  callee: { kind: 'identifier', name: 'bar' },
                  arguments: [{ kind: 'identifier', name: 'value' }],
                  optional: false,
                },
              ],
              optional: false,
            },
            {
              kind: 'call',
              callee: { kind: 'identifier', name: 'foo' },
              arguments: [
                {
                  kind: 'call',
                  callee: {
                    kind: 'property-access',
                    object: {
                      kind: 'property-access',
                      object: { kind: 'identifier', name: 'obj' },
                      optional: false,
                      property: 'nested',
                    },
                    optional: false,
                    property: 'execute',
                  },
                  arguments: [{ kind: 'identifier', name: 'value' }],
                  optional: false,
                },
              ],
              optional: false,
            },
            {
              kind: 'call',
              callee: { kind: 'identifier', name: 'foo' },
              arguments: [
                {
                  kind: 'call',
                  callee: { kind: 'identifier', name: 'bar' },
                  arguments: [
                    {
                      kind: 'call',
                      callee: {
                        kind: 'property-access',
                        object: { kind: 'identifier', name: 'obj' },
                        optional: false,
                        property: 'bar',
                      },
                      arguments: [{ kind: 'identifier', name: 'value' }],
                      optional: false,
                    },
                  ],
                  optional: false,
                },
              ],
              optional: false,
            },
          ]),
        )
      },
      timeout,
    )
    it(
      '08-function-handler.ts',
      async () => {
        const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
        console.log(`Filename: ${fileName}`)
        const result = await statementAnalysisProgram(fileName, 'call')

        const target = getFunction(result, 'FunctionHandler')
        console.dir(target, { depth: null })
        expect(target.elements.filter((e) => e.kind == 'call')).toEqual(
          expect.arrayContaining([
            {
              kind: 'call',
              callee: {
                kind: 'call',
                callee: { kind: 'identifier', name: 'createHandler' },
                arguments: [],
                optional: false,
              },
              arguments: [{ kind: 'string-literal', value: 'value' }],
              optional: false,
            },
          ]),
        )
      },
      timeout,
    )
    it(
      '09-interface-dependent.ts',
      async () => {
        const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
        console.log(`Filename: ${fileName}`)
        const result = await statementAnalysisProgram(fileName, 'call')

        const target = getFunction(result, 'FunctionHandler')
        // console.dir(target, { depth: null })
        expect(target.elements.filter((e) => e.kind == 'call')).toEqual(
          expect.arrayContaining([
            {
              kind: 'call',
              callee: { kind: 'identifier', name: 'callWithUser' },
              arguments: [
                {
                  kind: 'object-literal',
                  properties: [
                    {
                      kind: 'property',
                      name: 'name',
                      value: { kind: 'string-literal', value: 'ABC' },
                    },
                  ],
                },
              ],
              optional: false,
            },
          ]),
        )
      },
      timeout,
    )
  })
  it(
    '02-expression-new.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)

      const target = getFunction(result, 'createValue')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'return',
            expression: {
              kind: 'new',
              callee: { kind: 'identifier', name: 'Foo' },
              arguments: [],
            },
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '03-expression-assignment.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)

      const target = getFunction(result, 'AssignmentTest')
      console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'return',
            expression: {
              kind: 'new',
              callee: { kind: 'identifier', name: 'Foo' },
              arguments: [],
            },
          },
        ]),
      )
    },
    timeout,
  )
})
