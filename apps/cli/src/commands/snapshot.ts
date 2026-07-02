import { join } from 'node:path'
import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { makeRunner } from '@gyomu/schema/effect'
import {
  analyzeProjectChanges,
  commitProjectSnapshot,
  deleteSnapshot,
  isTestFile,
  listTypescriptProject,
  processTsDocUpdate,
} from '@gyomu/tsdoc'
import { Effect, Layer } from 'effect'

import {
  FileSearchServiceLayer,
  createPathMatcher,
  makeDirectory,
  removePath,
  writeStringToFile,
} from '@gyomu/infra/fs'
import { analyzeFile, initializeProjectContext } from '@gyomu/ts-analysis'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(
  Layer.provideMerge(PlatformLayer),
  Layer.provideMerge(FileSearchServiceLayer),
)
const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)
export const snapshotCommand = (
  projectName: string,
  options?: { buildTsDoc?: boolean; filter?: string; commit?: boolean; recommit?: boolean },
) => {
  return runQAWithEnvOrThrow(
    Effect.gen(function* () {
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
      const projectAbsolutePath = projectContext.projectRoot
      if (options?.recommit) {
        yield* deleteSnapshot({
          projectPath: targetProject.rootPath,
          repoRoot: projects.repositoryRoot,
        })

        yield* removePath(join(projectAbsolutePath, '.gyomu'), { recursive: true })
      }

      let changeResult = yield* analyzeProjectChanges({
        repoRoot: projects.repositoryRoot,
        projectPath: targetProject.rootPath,
      })

      console.dir(
        { snapshotPath: changeResult.snapshotPath, projectId: changeResult.projectId },
        { depth: null },
      )
      console.dir(changeResult.diff, { depth: null })

      const fileFilter = createPathMatcher(options?.filter)

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
            let fileResult = yield* analyzeFile(projectContext, targetFilePath)

            // yield* writeStringToFile(
            //   './log/fileAnalysis.txt',
            //   JSON.stringify(fileResult.analysis, null, 2),
            // )

            if (options?.buildTsDoc) {
              yield* processTsDocUpdate(projectContext, fileResult, {
                debugInfo: {
                  // JsDocUpdateContext: true,
                  // JsDocUpdatePlan: true,
                  // DumpToFile: true,
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
              fileResult = yield* analyzeFile(projectContext, targetFilePath)
            }
            if (options?.commit || options?.recommit) {
              // Save FileAnalysis on project/.gyomu/<filePath>.json
              const fileAnalysisPath = join(
                projectAbsolutePath,
                '.gyomu',
                fileChange.path + '.json',
              )
              yield* writeStringToFile(
                fileAnalysisPath,
                JSON.stringify(fileResult.analysis, null, 2),
              )
            }
            break
          }
          case 'deleted': {
            if (options?.commit || options?.recommit) {
              // Delete FileAnalysis file from project/.gyomu/<filePath>.json
              const fileAnalysisPath = join(
                projectAbsolutePath,
                '.gyomu',
                fileChange.path + '.json',
              )
              yield* removePath(fileAnalysisPath)
            }
            break
          }
        }
      }
      if (options?.commit || options?.recommit) {
        if (options.buildTsDoc) {
          changeResult = yield* analyzeProjectChanges({
            repoRoot: projects.repositoryRoot,
            projectPath: targetProject.rootPath,
          })
        }
        yield* commitProjectSnapshot({
          expectedSnapshot: changeResult.currentSnapshot,
          projectPath: targetProject.rootPath,
          repoRoot: projects.repositoryRoot,
        })
      }
    }),
    layer,
  )
}
