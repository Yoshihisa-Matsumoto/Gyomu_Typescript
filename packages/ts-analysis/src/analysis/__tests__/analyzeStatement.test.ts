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
        // console.dir(target, { depth: null })
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
        // console.dir(target, { depth: null })
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
        // console.dir(target, { depth: null })
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
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'assignment',
            left: {
              kind: 'property-access',
              object: { kind: 'identifier', name: 'obj' },
              optional: false,
              property: 'value',
            },
            right: { kind: 'identifier', name: 'value' },
            operator: '=',
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '04-variable-declaration.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)

      const target = getFunction(result, 'variableDeclaration')
      // console.dir(target, { depth: null })
      const variables = target.elements.filter((e) => e.kind == 'variable-declaration')
      expect(
        variables.find((v) => v.symbol.identity.symbolId == 'result')?.initializer,
      ).toMatchObject({
        kind: 'call',
        callee: { kind: 'identifier', name: 'foo' },
        arguments: [{ kind: 'identifier', name: 'value' }],
        optional: false,
      })
      expect(variables.find((v) => v.symbol.identity.symbolId == 'a')?.initializer).toMatchObject({
        kind: 'call',
        callee: { kind: 'identifier', name: 'foo' },
        arguments: [{ kind: 'identifier', name: 'value' }],
        optional: false,
      })
      expect(variables.find((v) => v.symbol.identity.symbolId == 'b')?.initializer).toMatchObject({
        kind: 'call',
        callee: { kind: 'identifier', name: 'bar' },
        arguments: [],
        optional: false,
      })
      expect(variables.find((v) => v.symbol.identity.symbolId == 'c')?.initializer).toBeUndefined()
    },
    timeout,
  )
  it(
    '05-return.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)

      const target = getFunction(result, 'returnValue')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'return',
            expression: {
              kind: 'call',
              callee: { kind: 'identifier', name: 'foo' },
              arguments: [{ kind: 'identifier', name: 'value' }],
              optional: false,
            },
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '06-throw.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)

      const target = getFunction(result, 'throwError')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'throw',
            expression: {
              kind: 'new',
              callee: { kind: 'identifier', name: 'Error' },
              arguments: [{ kind: 'string-literal', value: 'invalid' }],
            },
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '07-await-01.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'awaitValue')
      // console.dir(target, { depth: null })
      expect(
        target.elements.find((e) => e.kind == 'variable-declaration')?.initializer,
      ).toMatchObject({
        kind: 'await',
        expression: {
          kind: 'call',
          callee: { kind: 'identifier', name: 'foo' },
          arguments: [],
          optional: false,
        },
      })
    },
    timeout,
  )
  it(
    '07-await-02.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'awaitValue')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'await',
            expression: {
              kind: 'call',
              callee: { kind: 'identifier', name: 'foo' },
              arguments: [],
              optional: false,
            },
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '07-await-03.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'awaitValue')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'return',
            expression: {
              kind: 'await',
              expression: {
                kind: 'call',
                callee: { kind: 'identifier', name: 'foo' },
                arguments: [],
                optional: false,
              },
            },
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '08-if.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'ifStatement')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'if',
            expression: { kind: 'identifier', name: 'value' },
            then: {
              kind: 'block',
              children: [
                {
                  kind: 'call',
                  callee: { kind: 'identifier', name: 'foo' },
                  arguments: [],
                  optional: false,
                },
              ],
            },
            else: undefined,
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '09-if-else.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'ifElse')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'if',
            expression: { kind: 'identifier', name: 'value' },
            then: {
              kind: 'block',
              children: [
                {
                  kind: 'call',
                  callee: { kind: 'identifier', name: 'foo' },
                  arguments: [],
                  optional: false,
                },
              ],
            },
            else: {
              kind: 'block',
              children: [
                {
                  kind: 'call',
                  callee: { kind: 'identifier', name: 'bar' },
                  arguments: [],
                  optional: false,
                },
              ],
            },
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '10-nested-if.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'nestedIf')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'if',
            expression: { kind: 'identifier', name: 'value' },
            then: {
              kind: 'block',
              children: [
                {
                  kind: 'if',
                  expression: { kind: 'identifier', name: 'other' },
                  then: {
                    kind: 'block',
                    children: [
                      {
                        kind: 'call',
                        callee: { kind: 'identifier', name: 'foo' },
                        arguments: [],
                        optional: false,
                      },
                    ],
                  },
                  else: undefined,
                },
              ],
            },
            else: undefined,
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '11-else-if.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'elseIf')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'if',
            expression: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'value' },
              right: { kind: 'numeric-literal', value: 10 },
              operator: '>',
            },
            then: {
              kind: 'block',
              children: [
                {
                  kind: 'call',
                  callee: { kind: 'identifier', name: 'foo' },
                  arguments: [],
                  optional: false,
                },
              ],
            },
            else: {
              kind: 'if',
              expression: {
                kind: 'binary',
                left: { kind: 'identifier', name: 'value' },
                right: { kind: 'numeric-literal', value: 0 },
                operator: '>',
              },
              then: {
                kind: 'block',
                children: [
                  {
                    kind: 'call',
                    callee: { kind: 'identifier', name: 'bar' },
                    arguments: [],
                    optional: false,
                  },
                ],
              },
              else: {
                kind: 'block',
                children: [
                  {
                    kind: 'call',
                    callee: { kind: 'identifier', name: 'baz' },
                    arguments: [],
                    optional: false,
                  },
                ],
              },
            },
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '12-switch.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'switchStatement')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'switch',
            expression: { kind: 'identifier', name: 'value' },
            children: [
              {
                kind: 'switch-case',
                expression: { kind: 'string-literal', value: 'a' },
                children: [
                  {
                    kind: 'call',
                    callee: { kind: 'identifier', name: 'foo' },
                    arguments: [],
                    optional: false,
                  },
                  { kind: 'break' },
                ],
              },
              {
                kind: 'switch-case',
                expression: { kind: 'string-literal', value: 'b' },
                children: [
                  {
                    kind: 'call',
                    callee: { kind: 'identifier', name: 'bar' },
                    arguments: [],
                    optional: false,
                  },
                  { kind: 'break' },
                ],
              },
              {
                kind: 'switch-default',
                children: [
                  {
                    kind: 'call',
                    callee: { kind: 'identifier', name: 'baz' },
                    arguments: [],
                    optional: false,
                  },
                  { kind: 'break' },
                ],
              },
            ],
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '13-loop-forOf.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'forOfStatement')
      // console.dir(target, { depth: null })
      const targetFor = target.elements.find((e) => e.kind == 'for')!
      expect(targetFor.expression).toMatchObject({ kind: 'identifier', name: 'values' })

      expect(targetFor.initializer).toHaveLength(1)
      expect(targetFor.statement).toMatchObject({
        kind: 'block',
        children: [
          {
            kind: 'call',
            callee: { kind: 'identifier', name: 'foo' },
            arguments: [{ kind: 'identifier', name: 'value' }],
            optional: false,
          },
        ],
      })
      expect(targetFor.isAwait).toBeFalsy()
    },
    timeout,
  )
  it(
    '13-loop-forIn.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'forInStatement')
      // console.dir(target, { depth: null })
      const targetFor = target.elements.find((e) => e.kind == 'for')!
      expect(targetFor.expression).toMatchObject({ kind: 'identifier', name: 'myObject' })

      expect(targetFor.initializer).toHaveLength(1)
      expect(targetFor.statement).toMatchObject({
        kind: 'block',
        children: [
          {
            kind: 'call',
            callee: {
              kind: 'property-access',
              object: { kind: 'identifier', name: 'console' },
              optional: false,
              property: 'log',
            },
            arguments: [
              { kind: 'identifier', name: 'key' },
              {
                kind: 'computed-access',
                object: { kind: 'identifier', name: 'myObject' },
                optional: false,
                index: { kind: 'identifier', name: 'key' },
              },
            ],
            optional: false,
          },
        ],
      })
      expect(targetFor.isAwait).toBeFalsy()
    },
    timeout,
  )
  it(
    '13-loop-for.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'forStatement')
      // console.dir(target, { depth: null })
      const targetFor = target.elements.find((e) => e.kind == 'for')!
      expect(targetFor.expression).toMatchObject({
        kind: 'binary',
        left: { kind: 'identifier', name: 'i' },
        right: {
          kind: 'property-access',
          object: { kind: 'identifier', name: 'myArray' },
          optional: false,
          property: 'length',
        },
        operator: '<',
      })
      expect(targetFor.incrementor).toBeDefined()
      expect(targetFor.incrementor).toMatchObject({
        kind: 'unary',
        prefix: false,
        operand: { kind: 'identifier', name: 'i' },
        operator: '++',
      })
      expect(targetFor.initializer).toHaveLength(1)
      expect(targetFor.statement).toMatchObject({
        kind: 'block',
        children: [
          {
            kind: 'call',
            callee: {
              kind: 'property-access',
              object: { kind: 'identifier', name: 'console' },
              optional: false,
              property: 'log',
            },
            arguments: [
              {
                kind: 'computed-access',
                object: { kind: 'identifier', name: 'myArray' },
                optional: false,
                index: { kind: 'identifier', name: 'i' },
              },
            ],
            optional: false,
          },
        ],
      })
      expect(targetFor.isAwait).toBeFalsy()
    },
    timeout,
  )
  it(
    '13-loop-forAwaitOf.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'forAwaitOfStatement')
      // console.dir(target, { depth: null })
      const targetFor = target.elements.find((e) => e.kind == 'for')!
      expect(targetFor.expression).toMatchObject({
        kind: 'call',
        callee: { kind: 'identifier', name: 'foo' },
        arguments: [],
        optional: false,
      })
      expect(targetFor.initializer).toHaveLength(1)
      expect(targetFor.statement).toMatchObject({
        kind: 'block',
        children: [
          {
            kind: 'call',
            callee: {
              kind: 'property-access',
              object: { kind: 'identifier', name: 'console' },
              optional: false,
              property: 'log',
            },
            arguments: [{ kind: 'identifier', name: 'value' }],
            optional: false,
          },
        ],
      })
      expect(targetFor.isAwait).toBeTruthy()
    },
    timeout,
  )
  it(
    '13-loop-while.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'whileStatement')
      // console.dir(target, { depth: null })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'while',
            expression: { kind: 'identifier', name: 'value' },
            statement: {
              kind: 'block',
              children: [
                {
                  kind: 'call',
                  callee: { kind: 'identifier', name: 'foo' },
                  arguments: [],
                  optional: false,
                },
              ],
            },
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '14-try-tryCatch.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'tryCatchFunction')
      // console.dir(target, { depth: null })
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const tryTarget = target.elements.find((e) => e.kind == 'try')!
      expect(tryTarget.statement).toMatchObject({
        kind: 'block',
        children: [
          {
            kind: 'call',
            callee: { kind: 'identifier', name: 'foo' },
            arguments: [],
            optional: false,
          },
        ],
      })
      expect(tryTarget.catch).toBeDefined()
      expect(tryTarget.catch?.variable).toBeDefined()
      expect(tryTarget.catch?.statement).toMatchObject({
        kind: 'block',
        children: [
          {
            kind: 'call',
            callee: { kind: 'identifier', name: 'bar' },
            arguments: [{ kind: 'identifier', name: 'error' }],
            optional: false,
          },
        ],
      })
      expect(tryTarget.finally).toBeUndefined()
    },
    timeout,
  )
  it(
    '14-try-tryCatchFinally.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'tryCatchFinallyFunction')
      // console.dir(target, { depth: null })
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const tryTarget = target.elements.find((e) => e.kind == 'try')!
      expect(tryTarget.statement).toMatchObject({
        kind: 'block',
        children: [
          {
            kind: 'call',
            callee: { kind: 'identifier', name: 'foo' },
            arguments: [],
            optional: false,
          },
        ],
      })
      expect(tryTarget.catch?.variable).toBeDefined()
      expect(tryTarget.catch?.statement).toMatchObject({
        kind: 'block',
        children: [
          {
            kind: 'call',
            callee: { kind: 'identifier', name: 'bar' },
            arguments: [{ kind: 'identifier', name: 'error' }],
            optional: false,
          },
        ],
      })
      expect(tryTarget.finally).toBeDefined()
      expect(tryTarget.finally).toMatchObject({
        kind: 'block',
        children: [
          {
            kind: 'call',
            callee: { kind: 'identifier', name: 'baz' },
            arguments: [],
            optional: false,
          },
        ],
      })
    },
    timeout,
  )
  it(
    '15-expression-binary.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'binaryOperators')
      // console.dir(
      //   target.elements
      //     .filter((e) => e.kind == 'variable-declaration')
      //     .map((e) => ({
      //       symbolId: e.symbol.identity.symbolId,
      //       initializer: e.initializer,
      //     })),
      //   { depth: null },
      // )
      expect(
        target.elements
          .filter((e) => e.kind == 'variable-declaration')
          .map((e) => ({
            symbolId: e.symbol.identity.symbolId,
            initializer: e.initializer,
          })),
      ).toEqual(
        expect.arrayContaining([
          {
            symbolId: 'eq',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '==',
            },
          },
          {
            symbolId: 'neq',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '!=',
            },
          },
          {
            symbolId: 'strictEq',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '===',
            },
          },
          {
            symbolId: 'strictNeq',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '!==',
            },
          },
          {
            symbolId: 'lt',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '<',
            },
          },
          {
            symbolId: 'lte',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '<=',
            },
          },
          {
            symbolId: 'gt',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '>',
            },
          },
          {
            symbolId: 'gte',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '>=',
            },
          },
          {
            symbolId: 'inOperator',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'obj' },
              operator: 'in',
            },
          },
          {
            symbolId: 'instanceofOperator',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: 'instanceof',
            },
          },
          {
            symbolId: 'add',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '+',
            },
          },
          {
            symbolId: 'subtract',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '-',
            },
          },
          {
            symbolId: 'multiply',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '*',
            },
          },
          {
            symbolId: 'divide',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '/',
            },
          },
          {
            symbolId: 'modulo',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '%',
            },
          },
          {
            symbolId: 'power',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '**',
            },
          },
          {
            symbolId: 'leftShift',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '<<',
            },
          },
          {
            symbolId: 'rightShift',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '>>',
            },
          },
          {
            symbolId: 'unsignedRightShift',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '>>>',
            },
          },
          {
            symbolId: 'bitAnd',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '&',
            },
          },
          {
            symbolId: 'bitXor',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '^',
            },
          },
          {
            symbolId: 'bitOr',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '|',
            },
          },
          {
            symbolId: 'logicalAnd',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '&&',
            },
          },
          {
            symbolId: 'logicalOr',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '||',
            },
          },
          {
            symbolId: 'nullish',
            initializer: {
              kind: 'binary',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
              operator: '??',
            },
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '16-expression-and.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'getAnd')
      // console.dir(target.elements.find((e) => e.kind == 'variable-declaration')?.initializer, {
      //   depth: null,
      // })
      expect(
        target.elements.find((e) => e.kind == 'variable-declaration')?.initializer,
      ).toMatchObject({
        kind: 'binary',
        left: { kind: 'identifier', name: 'value' },
        right: {
          kind: 'call',
          callee: { kind: 'identifier', name: 'foo' },
          arguments: [],
          optional: false,
        },
        operator: '&&',
      })
    },
    timeout,
  )
  it(
    '17-expression-or.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'getBinary')
      // console.dir(target.elements.find((e) => e.kind == 'variable-declaration')?.initializer, {
      //   depth: null,
      // })
      expect(
        target.elements.find((e) => e.kind == 'variable-declaration')?.initializer,
      ).toMatchObject({
        kind: 'binary',
        left: { kind: 'identifier', name: 'value' },
        right: {
          kind: 'call',
          callee: { kind: 'identifier', name: 'foo' },
          arguments: [],
          optional: false,
        },
        operator: '||',
      })
    },
    timeout,
  )
  it(
    '18-expression-conditional.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'getBinary')
      // console.dir(target.elements.find((e) => e.kind == 'variable-declaration')?.initializer, {
      //   depth: null,
      // })
      expect(
        target.elements.find((e) => e.kind == 'variable-declaration')?.initializer,
      ).toMatchObject({
        kind: 'call',
        callee: {
          kind: 'property-access',
          object: { kind: 'identifier', name: 'value' },
          optional: true,
          property: 'foo',
        },
        arguments: [],
        optional: false,
      })
    },
    timeout,
  )
  it(
    '19-function-declaration.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = getFunction(result, 'declarationFunc')
      // console.dir(target, {
      //   depth: null,
      // })
      expect(target.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'call',
            callee: { kind: 'identifier', name: 'foo' },
            arguments: [],
            optional: false,
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '20-function-arrow.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = result.find((s) => s.identity.symbolId == 'arrowFunc')?.functionBody
      // console.dir(result, {
      //   depth: null,
      // })
      expect(target?.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'call',
            callee: { kind: 'identifier', name: 'foo' },
            arguments: [],
            optional: false,
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '21-function-expression.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = result.find((s) => s.identity.symbolId == 'expression')?.functionBody
      // console.dir(result, {
      //   depth: null,
      // })
      expect(target?.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'call',
            callee: { kind: 'identifier', name: 'foo' },
            arguments: [],
            optional: false,
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '22-function-arrowExpression.ts',
    async () => {
      const fileName = expect.getState().currentTestName!.split(' > ').at(-1)!
      // console.log(`Filename: ${fileName}`)
      const result = await statementAnalysisProgram(fileName)
      const target = result.find((s) => s.identity.symbolId == 'arrowExpression')
      // console.dir(result, {
      //   depth: null,
      // })q
      expect(target?.functionBody?.elements).toEqual(
        expect.arrayContaining([
          {
            kind: 'call',
            callee: { kind: 'identifier', name: 'foo' },
            arguments: [],
            optional: false,
          },
        ]),
      )
    },
    timeout,
  )
})
