import { join } from 'node:path'
import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { makeRunner } from '@gyomu/schema/effect'
import {
  analyzeFile,
  analyzeProjectChanges,
  initializeProjectContext,
  listTypescriptProject,
  processTsDocUpdate,
} from '@gyomu/tsdoc'
import { Effect, Layer } from 'effect'

import { FileSearchServiceLayer, makeDirectory, writeStringToFile } from '@gyomu/infra/fs'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(
  Layer.provideMerge(PlatformLayer),
  Layer.provideMerge(FileSearchServiceLayer),
)
const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)
export const snapshotCommand = (projectName: string, options?: { buildTsDoc?: boolean }) => {
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
              const targetFilePath = join(projectAbsolutePath, fileChange.path)
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
              })
            }
          }
        }
      }
    }),
    layer,
  )
}
