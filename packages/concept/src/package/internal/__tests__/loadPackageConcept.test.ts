import fs, { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { Effect, Exit } from 'effect'
import { NodeFileSystem } from '@effect/platform-node'
import { FullPath, getFailureFromExit } from '@gyomu/schema'
import { describe, expect, it } from 'vitest'
import { PlatformLayer } from '@gyomu/infra'
import { createFixtureProject } from '@gyomu/ts-analysis/testing'
import { loadPackageConcept } from '../loadPackageConcept.js'
import { ConceptError } from '../../../error/ConceptError.js'

import { savePackageConcept } from '../savePackageConcept.js'
import type { PackageConcept } from '@gyomu/schema/schemas/concept'
import type { ProjectContext } from '@gyomu/ts-analysis'

describe('loadPackageConcept', () => {
  const createContext = (root: string): ProjectContext =>
    ({
      projectRoot: FullPath(root),
    }) as ProjectContext

  const concept: PackageConcept = {
    summary: 'Summary',
    responsibilities: ['Responsibility1', 'Responsibility2'],
    capabilities: [{ name: 'Capability1', description: 'Capability Description1' }],
    designDecisions: ['Decision1'],
    usageGuidance: ['Usage1'],
  } satisfies PackageConcept

  it('loads directory concept', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), '.tmp-'))
    const context = createContext(root)

    await mkdir(join(root, '.gyomu', 'concept', 'src'), { recursive: true })

    // await writeFile(
    //   join(root, '.gyomu', 'src', '$Package.json'),
    //   JSON.stringify(concept, null, 2),
    // )
    await Effect.runPromise(
      savePackageConcept(context, concept).pipe(Effect.provide(PlatformLayer)),
    )

    const result = await Effect.runPromise(
      loadPackageConcept(context)
        .pipe(Effect.provide(NodeFileSystem.layer))
        .pipe(
          Effect.catch((e) => {
            if (e.details) console.dir(e, { depth: null })

            return Effect.fail(e)
          }),
        ),
    )

    expect(result).toEqual(concept)
  })

  it('returns undefined when file does not exist', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), '.tmp-'))

    const result = await Effect.runPromise(
      loadPackageConcept(createContext(root)).pipe(Effect.provide(NodeFileSystem.layer)),
    )

    expect(result).toBeUndefined()
  })

  it('wraps invalid json as ConceptError', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), '.tmp-'))

    await mkdir(join(root, '.gyomu', 'concept'), { recursive: true })

    await writeFile(join(root, '.gyomu', 'concept', '$Package.json'), '{')

    const exit = await Effect.runPromiseExit(
      loadPackageConcept(createContext(root)).pipe(Effect.provide(NodeFileSystem.layer)),
    )

    expect(Exit.isFailure(exit)).toBe(true)

    if (Exit.isFailure(exit)) {
      // console.dir(exit, { depth: null })
      const failure = getFailureFromExit(exit)

      expect(failure._tag).toBe('@gyomu/concept/ConceptError')
      expect(failure).toBeInstanceOf(ConceptError)
      expect(failure.message).toBe('Fail to load Package Concept')
      expect(failure.phase).toBe('package-concept')
    }
  })

  it('wraps schema validation error as ConceptError', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), '.tmp-'))

    await mkdir(join(root, '.gyomu', 'concept'), { recursive: true })

    await writeFile(join(root, '.gyomu', 'concept', '$Package.json'), JSON.stringify({}, null, 2))

    const exit = await Effect.runPromiseExit(
      loadPackageConcept(createContext(root)).pipe(Effect.provide(NodeFileSystem.layer)),
    )

    expect(Exit.isFailure(exit)).toBe(true)

    if (Exit.isFailure(exit)) {
      const failure = getFailureFromExit(exit)

      expect(failure._tag).toBe('@gyomu/concept/ConceptError')
      expect(failure).toBeInstanceOf(ConceptError)
      expect(failure.message).toBe('Fail to load Package Concept')
    }
  })
  it('loads from metadataRoot when specified', async () => {
    const project = createFixtureProject('load-directory-concept')

    const result = await Effect.runPromise(
      loadPackageConcept(project, {
        metadataRoot: 'mock-gyomu',
      }).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result?.summary).toBe('Summary')
  })
})
