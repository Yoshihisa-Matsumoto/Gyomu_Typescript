import path from 'node:path'
import { FullPath } from '@gyomu/schema'
import { Effect } from 'effect'
import { PlatformLayer } from '@gyomu/infra'
import { describe, expect, test } from 'vitest'
import { analyzePackageJson } from '../../shared/project/analyzePackageJson.js'
import { AnalysisError } from '../error/AnalysisError.js'
import type { PackageDependency } from '@gyomu/schema/typescript'

const effectProgram = (subDir: string) =>
  Effect.gen(function* () {
    const packageDirectory = FullPath(
      path.resolve(path.join('./test-fixtures', 'package-json', subDir)),
    )
    return yield* analyzePackageJson(packageDirectory)
  }).pipe(Effect.provide(PlatformLayer))

const analyzePackageJsonProgram = async (subDir: string) =>
  await Effect.runPromise(effectProgram(subDir))

const analyzePackageJsonProgramWithError = async (subDir: string) =>
  await effectProgram(subDir).pipe(Effect.flip, Effect.runPromise)

describe('analyzePackageJson', () => {
  test('minimal', async () => {
    const result = await analyzePackageJsonProgram('minimal')
    expect(result.name).toBe('@gyomu/test')
  })
  test('exports', async () => {
    const result = await analyzePackageJsonProgram('exports')
    expect(result.exports).toEqual(
      expect.arrayContaining([
        {
          exportPath: '.',
          wildcard: false,
          targets: [
            {
              condition: undefined,
              target: './dist/index.js',
            },
          ],
        },
        {
          exportPath: './cli',
          wildcard: false,
          targets: [
            {
              condition: undefined,
              target: './dist/cli.js',
            },
          ],
        },
        {
          exportPath: './schema/*',
          wildcard: true,
          targets: [
            {
              condition: undefined,
              target: './dist/schema/*.js',
            },
          ],
        },
      ]),
    )
  })
  test('conditional-exports', async () => {
    const result = await analyzePackageJsonProgram('conditional-exports')
    expect(result.exports).toEqual(
      expect.arrayContaining([
        {
          exportPath: '.',
          wildcard: false,
          targets: [
            {
              condition: 'types',
              target: './dist/index.d.ts',
            },
            {
              condition: 'default',
              target: './dist/index.js',
            },
          ],
        },
      ]),
    )
  })
  test('dependencies', async () => {
    const result = await analyzePackageJsonProgram('dependencies')
    expect(result.dependencies).toEqual(
      expect.arrayContaining([
        {
          packageName: 'react',
          kind: 'version',
          specifier: '^19.0.0',
        },
        {
          packageName: '@gyomu/core',
          kind: 'workspace',
          specifier: 'workspace:*',
        },
        {
          packageName: '@effect/schema',
          kind: 'catalog',
          specifier: 'catalog:',
        },
        {
          packageName: 'foo',
          kind: 'file',
          specifier: 'file:../foo',
        },
        {
          packageName: 'bar',
          kind: 'link',
          specifier: 'link:../bar',
        },
      ] satisfies Array<PackageDependency>),
    )
    expect(result.devDependencies).toEqual(
      expect.arrayContaining([
        {
          packageName: 'dev',
          kind: 'version',
          specifier: '0.1.5',
        },
      ]),
    )
    expect(result.peerDependencies).toEqual(
      expect.arrayContaining([
        {
          packageName: 'peer',
          kind: 'version',
          specifier: '1.0.2',
        },
      ]),
    )
    expect(result.optionalDependencies).toEqual(
      expect.arrayContaining([
        {
          packageName: 'optional',
          kind: 'version',
          specifier: '0.1.4',
        },
      ]),
    )
  })
  test('invalid-json', async () => {
    const error = await analyzePackageJsonProgramWithError('invalid-json')
    expect(error).toBeInstanceOf(AnalysisError)
  })
  test('invalid-path', async () => {
    const error = await analyzePackageJsonProgramWithError('invalid-path')
    expect(error).toBeInstanceOf(AnalysisError)
  })
})
