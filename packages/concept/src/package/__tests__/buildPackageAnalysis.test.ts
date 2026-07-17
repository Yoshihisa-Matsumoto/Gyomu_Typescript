import path from 'node:path'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { Effect } from 'effect'
import { PlatformLayer } from '@gyomu/infra'
import { FileSearchServiceLayer } from '@gyomu/infra/fs'
import { beforeAll, describe, expect, test } from 'vitest'
import { initializeProjectContext } from '@gyomu/ts-analysis'
import { FullPath } from '@gyomu/schema'
import { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { buildPackageAnalysis } from '../buildPackageAnalysis.js'

// const project = createFixtureProject(path.join('package-analysis'))

const buildPackageAnalysisProgram = (testCase?: string) =>
  Effect.gen(function* () {
    const repoRoot = testCase
      ? FullPath(path.join(destRoot, testCase))
      : FullPath(path.join('test-fixtures', 'package-analysis'))

    const context = yield* initializeProjectContext({
      repoRoot: repoRoot,
      projectRelativePath: WorkspaceRelativePath('.'),
    })
    return yield* buildPackageAnalysis(context, { metadataRoot: 'mock-gyomu' })
  })

const runProgram = async (testCase?: string) => {
  return await Effect.runPromise(
    buildPackageAnalysisProgram(testCase).pipe(
      Effect.provide(PlatformLayer),
      Effect.provide(FileSearchServiceLayer),
    ),
  )
}

async function copyDir(src: string, dest: string) {
  await fs.rm(dest, { recursive: true, force: true })
  await fs.mkdir(dest, { recursive: true })

  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

const destRoot = path.join(tmpdir(), 'concept-project-analysis')
beforeAll(async () => {
  await fs.rm(destRoot, { recursive: true, force: true })
  await fs.mkdir(destRoot, { recursive: true })
})

const prepare = async (testCase: string) => {
  const destCasePath = path.join(destRoot, testCase)
  await copyDir(path.join('test-fixtures', 'package-analysis'), destCasePath)
  await fs.copyFile(
    path.join(destCasePath, `${testCase}.json`),
    path.join(destCasePath, 'package.json'),
  )
}

describe('buildPackageAnalysis', () => {
  test('single', async () => {
    await prepare('single')
    const projectAnalsyis = await runProgram('single')

    console.dir(projectAnalsyis, { depth: null })

    expect(projectAnalsyis.dependencies).toEqual(
      expect.arrayContaining([
        {
          kind: 'version',
          source: 'dependency',
          packageName: 'effect',
          requestedVersion: '^4.0.0',
          resolvedVersion: '^4.0.0',
        },
        {
          kind: 'version',
          source: 'devDependency',
          packageName: 'vitest',
          requestedVersion: '^3.0.0',
          resolvedVersion: '^3.0.0',
        },
      ]),
    )
    expect(projectAnalsyis.directories).toEqual(
      expect.arrayContaining([
        {
          path: 'src/usecase/internal',
          summary: {
            summary: 'internal',
            responsibilities: [],
            concepts: [],
            relationships: [],
            designDecisions: [],
          },
        },
      ]),
    )

    expect(projectAnalsyis.exportedFiles).toEqual(
      expect.arrayContaining([
        {
          path: 'src/usecase/internal/helper.ts',
          exports: [{ kind: 'const', summary: '', symbol: 'Help' }],
          reExports: [],
          dependencies: [],
        },
      ]),
    )

    expect(projectAnalsyis.exports).toEqual(
      expect.arrayContaining([
        {
          exportPath: '.',
          exportedSymbols: [
            {
              sourceFile: 'src/usecase/internal/helper.ts',
              kind: 'const',
              name: 'Help',
              summary: { kind: 'const', summary: '', symbol: 'Help' },
            },
          ],
        },
      ]),
    )
  })
  test('re-export', async () => {
    await prepare('export')
    const projectAnalsyis = await runProgram('export')

    console.dir(projectAnalsyis, { depth: null })

    expect(projectAnalsyis.directories.map((d) => d.path)).toEqual(
      expect.arrayContaining(['src/gyomu/customer', 'src']),
    )

    expect(projectAnalsyis.exportedFiles).toEqual(
      expect.arrayContaining([
        {
          path: 'src/gyomu/customer/index.ts',
          exports: [
            {
              kind: 'const',
              summary: 'Creates a customer greeting.',
              symbol: 'createCustomerGreeting',
            },
          ],
          reExports: [{ exportAll: true, module: '../../schema.js' }],
          dependencies: [],
        },
        {
          path: 'src/schema.ts',
          exports: [
            {
              kind: 'interface',
              summary: 'Runtime schema representing a greeting.',
              symbol: 'GreetingSchema',
            },
          ],
          reExports: [{ exportAll: true, module: 'effect' }],
          dependencies: [],
        },
      ]),
    )

    // expect(projectAnalsyis.exports).toEqual(
    //   expect.arrayContaining([
    //     {
    //       exportPath: '.',
    //       exportedSymbols: [
    //         {
    //           sourceFile: 'src/usecase/internal/helper.ts',
    //           kind: 'const',
    //           name: 'Help',
    //           summary: { kind: 'const', summary: '', symbol: 'Help' },
    //         },
    //       ],
    //     },
    //   ]),
    // )
  })
  test('multi-reexport', async () => {
    await prepare('multi-reexport')
    const projectAnalsyis = await runProgram('multi-reexport')

    console.dir(projectAnalsyis, { depth: null })

    expect(projectAnalsyis.directories.map((d) => d.path)).toEqual(
      expect.arrayContaining(['src', 'src/usecase']),
    )

    expect(projectAnalsyis.exportedFiles.map((e) => e.path)).toEqual(
      expect.arrayContaining(['src/index.ts', 'src/schema.ts', 'src/usecase/createGreeting.ts']),
    )
    expect(
      projectAnalsyis.exports
        .map((e) => e.exportedSymbols)
        .flat()
        .map((e) => e.name),
    ).toEqual(expect.arrayContaining(['createGreeting', 'GreetingSchema']))

    // expect(projectAnalsyis.exports).toEqual(
    //   expect.arrayContaining([
    //     {
    //       exportPath: '.',
    //       exportedSymbols: [
    //         {
    //           sourceFile: 'src/usecase/internal/helper.ts',
    //           kind: 'const',
    //           name: 'Help',
    //           summary: { kind: 'const', summary: '', symbol: 'Help' },
    //         },
    //       ],
    //     },
    //   ]),
    // )
  })
  test('duplicate-export', async () => {
    await prepare('duplicate-export')
    const projectAnalsyis = await runProgram('duplicate-export')

    console.dir(projectAnalsyis, { depth: null })

    expect(projectAnalsyis.directories.map((d) => d.path)).toEqual(
      expect.arrayContaining(['src', 'src/gyomu/order']),
    )

    expect(projectAnalsyis.exportedFiles.map((e) => e.path)).toEqual(
      expect.arrayContaining(['src/gyomu/order/index.ts', 'src/schema.ts']),
    )
    expect(
      projectAnalsyis.exports
        .map((e) => e.exportedSymbols)
        .flat()
        .map((e) => e.name),
    ).toEqual(expect.arrayContaining(['createOrderId', 'GreetingSchema']))

    // expect(projectAnalsyis.exports).toEqual(
    //   expect.arrayContaining([
    //     {
    //       exportPath: '.',
    //       exportedSymbols: [
    //         {
    //           sourceFile: 'src/usecase/internal/helper.ts',
    //           kind: 'const',
    //           name: 'Help',
    //           summary: { kind: 'const', summary: '', symbol: 'Help' },
    //         },
    //       ],
    //     },
    //   ]),
    // )
  })
  test('duplicate-file', async () => {
    await prepare('duplicate-file')
    const projectAnalsyis = await runProgram('duplicate-file')

    console.dir(projectAnalsyis, { depth: null })

    expect(projectAnalsyis.directories.map((d) => d.path)).toEqual(expect.arrayContaining(['src']))

    expect(projectAnalsyis.exportedFiles.map((e) => e.path)).toEqual(
      expect.arrayContaining(['src/duplicate-export.ts', 'src/duplicate-sub.ts', 'src/schema.ts']),
    )
    expect(
      projectAnalsyis.exports
        .map((e) => e.exportedSymbols)
        .flat()
        .map((e) => e.name),
    ).toEqual(expect.arrayContaining(['GreetingSchema']))

    // expect(projectAnalsyis.exports).toEqual(
    //   expect.arrayContaining([
    //     {
    //       exportPath: '.',
    //       exportedSymbols: [
    //         {
    //           sourceFile: 'src/usecase/internal/helper.ts',
    //           kind: 'const',
    //           name: 'Help',
    //           summary: { kind: 'const', summary: '', symbol: 'Help' },
    //         },
    //       ],
    //     },
    //   ]),
    // )
  })
  test('integration test', async () => {
    const projectAnalysis = await runProgram()

    console.dir(projectAnalysis, { depth: null })
  })
})
