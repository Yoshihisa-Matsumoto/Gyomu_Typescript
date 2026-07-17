import fs, { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { Effect, Exit } from 'effect'
import { NodeFileSystem } from '@effect/platform-node'
import { FullPath, getFailureFromExit } from '@gyomu/schema'
import { describe, expect, it } from 'vitest'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { PlatformLayer } from '@gyomu/infra'
import { loadDirectoryConcept } from '../loadDirectoryConcept.js'
import { ConceptError } from '../../../error/ConceptError.js'

import { saveDirectoryConcept } from '../saveDirectoryConcept.js'
import { createFixtureProject } from '../../__tests__/createFixtureProject.js'
import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'
import type { ProjectContext } from '@gyomu/ts-analysis'

describe('loadDirectoryConcept', () => {
  const createContext = (root: string): ProjectContext =>
    ({
      projectRoot: FullPath(root),
    }) as ProjectContext

  const concept: DirectoryConcept = {
    summary: 'Summary',
    responsibilities: ['Responsibility1', 'Responsibility2'],
    concepts: ['Concept1'],
    relationships: ['Relationship1'],
    designDecisions: ['Decision1'],
  }

  it('loads directory concept', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), '.tmp-'))
    const context = createContext(root)

    await mkdir(join(root, '.gyomu', 'src'), { recursive: true })

    // await writeFile(
    //   join(root, '.gyomu', 'src', '$Directory.json'),
    //   JSON.stringify(concept, null, 2),
    // )
    await Effect.runPromise(
      saveDirectoryConcept(context, ProjectRelativePath('src'), concept).pipe(
        Effect.provide(PlatformLayer),
      ),
    )

    const result = await Effect.runPromise(
      loadDirectoryConcept(context, ProjectRelativePath('src'))
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
      loadDirectoryConcept(createContext(root), ProjectRelativePath('src')).pipe(
        Effect.provide(NodeFileSystem.layer),
      ),
    )

    expect(result).toBeUndefined()
  })

  it('wraps invalid json as ConceptError', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), '.tmp-'))

    await mkdir(join(root, '.gyomu', 'src'), { recursive: true })

    await writeFile(join(root, '.gyomu', 'src', '$Directory.json'), '{')

    const exit = await Effect.runPromiseExit(
      loadDirectoryConcept(createContext(root), ProjectRelativePath('src')).pipe(
        Effect.provide(NodeFileSystem.layer),
      ),
    )

    expect(Exit.isFailure(exit)).toBe(true)

    if (Exit.isFailure(exit)) {
      // console.dir(exit, { depth: null })
      const failure = getFailureFromExit(exit)

      expect(failure._tag).toBe('@gyomu/concept/ConceptError')
      expect(failure).toBeInstanceOf(ConceptError)
      expect(failure.filePath).toBe('src')
      expect(failure.message).toBe('Fail to load Directory Concept')
      expect(failure.phase).toBe('directory-summary')
    }
  })

  it('wraps schema validation error as ConceptError', async () => {
    const root = await fs.mkdtemp(join(tmpdir(), '.tmp-'))

    await mkdir(join(root, '.gyomu', 'src'), { recursive: true })

    await writeFile(join(root, '.gyomu', 'src', '$Directory.json'), JSON.stringify({}, null, 2))

    const exit = await Effect.runPromiseExit(
      loadDirectoryConcept(createContext(root), ProjectRelativePath('src')).pipe(
        Effect.provide(NodeFileSystem.layer),
      ),
    )

    expect(Exit.isFailure(exit)).toBe(true)

    if (Exit.isFailure(exit)) {
      const failure = getFailureFromExit(exit)

      expect(failure._tag).toBe('@gyomu/concept/ConceptError')
      expect(failure).toBeInstanceOf(ConceptError)
      expect(failure.filePath).toBe('src')
      expect(failure.message).toBe('Fail to load Directory Concept')
    }
  })
  it('loads from metadataRoot when specified', async () => {
    const project = createFixtureProject('load-directory-concept')

    const result = await Effect.runPromise(
      loadDirectoryConcept(project, ProjectRelativePath('src/sample'), {
        metadataRoot: 'mock-gyomu',
      }).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result?.summary).toBe('mock')
  })
})
