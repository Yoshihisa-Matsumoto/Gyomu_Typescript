import { join, resolve } from 'node:path'
import { Project } from 'ts-morph'

const FIXTURE_ROOT = './test-fixtures'
export const createFixtureProject = (fixtureName: string) => {
  const fixtureRoot = resolve(FIXTURE_ROOT, fixtureName)

  return {
    project: new Project({
      tsConfigFilePath: join(fixtureRoot, 'tsconfig.json'),
    }),
    projectRoot: fixtureRoot,
  }
}
