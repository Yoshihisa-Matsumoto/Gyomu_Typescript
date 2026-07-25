import { join, resolve } from 'node:path'
import { Effect, Exit, Result } from 'effect'
import { FullPath, getFailureFromExit } from '@gyomu/schema'
import { PlatformLayer } from '@gyomu/infra'
import { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { describe, expect, it } from 'vitest'
import { initializeProjectContext } from '../initializeProjectContext.js'

const loadProgram = async (pathName: string) => {
  const result = await Effect.runPromise(
    initializeProjectContext({
      repoRoot: FullPath(resolve(join('test-fixtures', 'analysis', 'project-context', pathName))),
      projectRelativePath: WorkspaceRelativePath('.'),
    }).pipe(Effect.provide(PlatformLayer)),
  )
  return result
}
const loadProgramWithExit = async (pathName: string) => {
  const result = await Effect.runPromiseExit(
    initializeProjectContext({
      repoRoot: FullPath(resolve(join('test-fixtures', 'analysis', 'project-context', pathName))),
      projectRelativePath: WorkspaceRelativePath('.'),
    }).pipe(Effect.provide(PlatformLayer)),
  )
  expect(Exit.isFailure(result)).toBeTruthy()
  if (Exit.isFailure(result)) return getFailureFromExit(result)
}

describe('initializeProjectContext', () => {
  it('loads project context', async () => {
    const result = await loadProgram('normal')

    expect(result.projectName).toBe('@gyomu/test')
    console.dir(result, { depth: null })
    expect([...result.includedFiles].sort()).toEqual(['src/foo.ts', 'src/index.ts'])
  })
  it('loads project without package.json returns error', async () => {
    expect(await loadProgramWithExit('no-package')).toMatchObject({
      message: 'fail to read package.json',
    })
  })
  it('loads project with invalid package.json returns error', async () => {
    expect(await loadProgramWithExit('invalid-json')).toMatchObject({
      message: 'fail to parse package.json',
    })
  })
  it('loads project with package.json without name', async () => {
    expect(await loadProgramWithExit('no name')).toMatchObject({
      message: 'fail to read package.json',
    })
  })
}, 20_000)
