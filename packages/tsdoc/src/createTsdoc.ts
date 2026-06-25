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
    console.dir(projectContext.includedFiles, { depth: null })
    const filePath = join(projectContext.projectRoot, sourceFilename)
    const fileResult = yield* analyzeFile(projectContext, filePath)
    yield* writeStringToFile('./log/fileAnalysis.txt', JSON.stringify(fileResult.analysis, null, 2))
    // for (const key of fileResult.metadata.symbols.keys()) {
    //   const target = fileResult.metadata.symbols.get(key)
    //   console.log({ key, indent: target?.indent })
    // }
    yield* processTsDocUpdate(projectContext, fileResult, {
      debugInfo: {
        JsDocUpdateContext: true,
        JsDocUpdatePlan: true,
        DumpToFile: true,
        MergePlan: true,
        FileUpdatePlan: true,
        RenderedSymbolJsDoc: true,
        UpdatedSymbolJsDoc: true,
      },
      action: {
        // NoLLMRequest: true,
        // NoUpdateTSDoc: true,
        WriteToTempFolder: true,
      },
      retryOption: {
        observer: {
          onRetry: (params) => {
            if (params.attempt <= 3) {
              console.log(`attemt:${params.attempt} DelayMs: ${params.delayMs}`)
            } else {
              console.log(`attemt:${params.attempt} DelayMs: ${params.delayMs}`)
              console.log(JSON.stringify(params.error, null, 2))
            }
          },
        },
      },
    })
  })
  return await runQAWithEnvOrThrow(program, layer)
}

await processTsDocUpdateProgram(`@gyomu/schema`, `src/typescript/jsdoc/JsDocAnalysis.ts`)
// await processTsDocUpdateProgram(`@gyomu/schema`, `src/core/result.ts`)
// `src/conversation/index.ts`
// `src/core/result.ts`
// `src/effect/exit.ts`
// `src/data/crud/CrudRepository.ts`
// `src/data/crud/type.ts`
// `src/effect/timer.ts`   @template /@other タグ説明が変
// `src/entity/date.ts` @throw / @other tagが変
// `src/error/helper.ts` @other @throw tagが変
// `src/gyomu/file/transport.ts` FileTransportInfoのコンストラクタの説明をProtected Regionにする必要あり
// `src/typescript/jsdoc/JsDocAnalysis.ts` タグ内解析がおかしい部分あり hasRemarks, exampleCount, hasDepreciated, throwsCount, templateCount

// await processTsDocUpdateProgram(`@gyomu/tsdoc`, `src/analysis/symbol/SymbolAnalysis.ts`)
