import { join } from 'node:path'
import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { makeRunner } from '@gyomu/schema/effect'
import { Effect, Layer } from 'effect'

import 'dotenv/config'
import { writeStringToFile } from '@gyomu/infra/fs'
import { processTsDocUpdate } from './update/processTsDocUpdate.js'
import { analyzeFile } from './analysis/analyzeFile.js'
import { initializeProjectContext } from './analysis/initializeProjectContext.js'
import { listTypescriptProject } from './shared/index.js'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)

const processTsDocUpdateProgram = async (projectName: string, sourceFilename: string) => {
  // const filePath = join(projectRoot, sourceFilename)
  const program = Effect.gen(function* () {
    const projects = yield* listTypescriptProject()
    const targetProject = projects.projects.find((p) => p.name == projectName)
    if (!targetProject) {
      console.log(`${projectName} Not Found`)
      return
    }
    const projectContext = yield* initializeProjectContext({
      repoRoot: projects.repositoryRoot,
      projectRelativePath: targetProject.rootPath,
    })
    const filePath = join(projectContext.projectRoot, sourceFilename)
    const fileResult = yield* analyzeFile(projectContext, filePath)
    yield* writeStringToFile('./log/fileAnalysis.txt', JSON.stringify(fileResult.analysis, null, 2))
    yield* processTsDocUpdate(projectContext, fileResult, {
      debugInfo: {
        JsDocUpdateContext: true,
        JsDocUpdatePlan: true,
        DumpToFile: true,
      },
      action: {
        // NoLLMRequest: true,
        // NoUpdateTSDoc: true,
        WriteToTempFolder: true,
      },
    })
  })
  return await runQAWithEnvOrThrow(program, layer)
}

await processTsDocUpdateProgram(`@gyomu/schema`, `src/core/result.ts`)
// `src/conversation/index.ts`
// `src/core/result.ts`
