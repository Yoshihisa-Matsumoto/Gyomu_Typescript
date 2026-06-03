import { join, resolve } from 'node:path'
import { Project } from 'ts-morph'

const FIXTURE_ROOT = './test-fixtures'
export const createFixtureProject = (fixtureName: string, fixtureRootPath?: string) => {
  const fixtureRoot = resolve(fixtureRootPath ?? FIXTURE_ROOT, fixtureName)

  return {
    project: new Project({
      tsConfigFilePath: join(fixtureRoot, 'tsconfig.json'),
    }),
    projectRoot: fixtureRoot,
    projectName: 'test',
  }
}
