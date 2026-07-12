import fs from 'node:fs/promises'
import os from 'node:os'
import { join } from 'node:path'
import { FullPath } from '@gyomu/schema'
import { expect, it } from 'vitest'
import { Effect } from 'effect'
import { PlatformLayer } from '@gyomu/infra'
import { saveFileAnalysis } from '../saveFileAnalysis.js'
import type { ProjectContext } from '../project/ProjectContext.js'

import type { FileAnalysis } from '@gyomu/schema/schemas/typescript/index'

async function createTempDir() {
  const tmpDir = os.tmpdir()
  const prefix = 'myapp-'
  const tempDir = await fs.mkdtemp(join(tmpDir, prefix))
  return tempDir
}

it('saves file analysis as json', async () => {
  const root = await createTempDir()

  const context: ProjectContext = {
    projectRoot: FullPath(root),
    projectName: 'test',
    includedFiles: new Set(),
    project: {} as any,
  }

  const analysis: FileAnalysis = {
    path: 'src/foo.ts',
    symbols: [],
  } as any as FileAnalysis

  await Effect.runPromise(saveFileAnalysis(context, analysis).pipe(Effect.provide(PlatformLayer)))

  const content = await fs.readFile(join(root, '.gyomu', 'src', 'foo.ts.json'), 'utf8')

  expect(JSON.parse(content)).toEqual(analysis)
})
