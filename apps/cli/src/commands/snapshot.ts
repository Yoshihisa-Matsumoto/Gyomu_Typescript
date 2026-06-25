import { join } from 'node:path'
import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { makeRunner } from '@gyomu/schema/effect'
import {
  analyzeFile,
  analyzeProjectChanges,
  initializeProjectContext,
  isTestFile,
  listTypescriptProject,
  processTsDocUpdate,
} from '@gyomu/tsdoc'
import { Effect, Layer } from 'effect'

import {
  FileSearchServiceLayer,
  createPathMatcher,
  makeDirectory,
  writeStringToFile,
} from '@gyomu/infra/fs'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(
  Layer.provideMerge(PlatformLayer),
  Layer.provideMerge(FileSearchServiceLayer),
)
const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)
export const snapshotCommand = (
  projectName: string,
  options?: { buildTsDoc?: boolean; filter?: string },
) => {
  return runQAWithEnvOrThrow(
    Effect.gen(function* () {
      const projects = yield* listTypescriptProject()
      const targetProject = projects.projects.find((p) => p.name == projectName)
      if (!targetProject) {
        console.log(`${projectName} Not Found`)
        return
      }

      const changeResult = yield* analyzeProjectChanges({
        repoRoot: projects.repositoryRoot,
        projectPath: targetProject.rootPath,
      })

      console.dir(
        { snapshotPath: changeResult.snapshotPath, projectId: changeResult.projectId },
        { depth: null },
      )
      console.dir(changeResult.diff, { depth: null })

      const fileFilter = createPathMatcher(options?.filter)

      if (options?.buildTsDoc) {
        const projectContext = yield* initializeProjectContext({
          repoRoot: projects.repositoryRoot,
          projectRelativePath: targetProject.rootPath,
        })
        const projectAbsolutePath = projectContext.projectRoot
        yield* makeDirectory('./log')
        for (const fileChange of changeResult.diff) {
          switch (fileChange.type) {
            case 'added':
            case 'updated': {
              if (!fileFilter.match(fileChange.path)) {
                console.log(`${fileChange.path} is not the target. skip`)
                continue
              }

              const targetFilePath = join(projectAbsolutePath, fileChange.path)
              if (!projectContext.includedFiles.has(targetFilePath)) {
                console.log(`File:${targetFilePath} Not in the project`)
                continue
              }
              if (isTestFile(targetFilePath)) continue
              console.log(fileChange.path)
              const fileResult = yield* analyzeFile(projectContext, targetFilePath)

              yield* writeStringToFile(
                './log/fileAnalysis.txt',
                JSON.stringify(fileResult.analysis, null, 2),
              )

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
            }
          }
        }
      }
    }),
    layer,
  )
}
