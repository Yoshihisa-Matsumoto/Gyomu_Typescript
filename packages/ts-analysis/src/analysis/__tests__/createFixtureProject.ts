import { join, normalize, resolve } from 'node:path'
import { Project } from 'ts-morph'

const FIXTURE_ROOT = './test-fixtures'
export const createFixtureProject = (fixtureName: string, fixtureRootPath?: string) => {
  const fixtureRoot = resolve(fixtureRootPath ?? FIXTURE_ROOT, fixtureName)

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
