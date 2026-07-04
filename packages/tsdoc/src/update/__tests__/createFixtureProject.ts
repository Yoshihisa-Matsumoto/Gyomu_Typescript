import { join, normalize, resolve } from 'node:path'
import { FullPath } from '@gyomu/schema/typescript'
import { Project } from 'ts-morph'
import type { ProjectContext } from '@gyomu/ts-analysis'

const FIXTURE_ROOT = './test-fixtures'
export const createFixtureProject = (
  fixtureName: string,
  fixtureRootPath?: string,
): ProjectContext => {
  const fixtureRoot = FullPath(resolve(fixtureRootPath ?? FIXTURE_ROOT, fixtureName))

  const project = new Project({
    tsConfigFilePath: join(fixtureRoot, 'tsconfig.json'),
  })
  return {
    project,
    projectRoot: fixtureRoot,
    projectName: 'test',
    includedFiles: new Set(project.getSourceFiles().map((file) => normalize(file.getFilePath()))),
  }
}
