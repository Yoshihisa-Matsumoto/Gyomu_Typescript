import { join } from 'node:path'
import { createVercelAiLayer } from '@gyomu/ai/provider/vercel'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { makeRunner } from '@gyomu/schema/effect'
import {
  TsDocRouteId,
  analyzeProjectChanges,
  commitProjectSnapshot,
  deleteSnapshot,
  isTestFile,
  processTsDocUpdate,
} from '@gyomu/tsdoc'
import { DirectoryConceptRouteId, buildDirectoryConcept } from '@gyomu/concept/directory'
import { PackageConceptRouteId, buildPackageConcept } from '@gyomu/concept/package'
import { Effect, Layer } from 'effect'

import {
  FileSearchServiceLayer,
  createPathMatcher,
  makeDirectory,
  removePath,
  writeStringToFile,
} from '@gyomu/infra/fs'
import { analyzeFile, initializeProjectContext, listTypescriptProject } from '@gyomu/ts-analysis'
import { AI_MODELS } from '@gyomu/ai'
import type { AnalysisOptions } from '@gyomu/schema'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(
  Layer.provideMerge(PlatformLayer),
  Layer.provideMerge(FileSearchServiceLayer),
)
const runQAWithEnvOrThrow = makeRunner(
  createVercelAiLayer(
    new Map([
      [TsDocRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }],
      [DirectoryConceptRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }],
      [PackageConceptRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }],
    ]),
  ),
)
export const snapshotCommand = (
  projectName: string,
  options?: {
    buildTsDoc?: boolean
    filter?: string
    commit?: boolean
    recommit?: boolean
    loggingKeyword?: string
  },
) => {
  return runQAWithEnvOrThrow(
    Effect.gen(function* () {
      const analysisOption: AnalysisOptions = { debugInfo: { DumpToFile: true } }
      if (options?.loggingKeyword) {
        analysisOption.debugInfo = {
          keyword: options.loggingKeyword,
        }
      }

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

      console.dir(projectContext, { depth: null })
      console.dir(projectContext.includedFiles.keys().toArray())

      yield* makeDirectory('./log')
      for (const fileChange of changeResult.diff) {
        switch (fileChange.type) {
          case 'added':
          case 'updated': {
            if (!fileFilter.match(fileChange.projectRelativePath)) {
              console.log(`${fileChange.projectRelativePath} is not the target. skip`)
              continue
            }

            const targetFilePath = fileChange.projectRelativePath
            if (!projectContext.includedFiles.has(targetFilePath)) {
              console.log(`File:${targetFilePath} Not in the project`)
              continue
            }
            if (isTestFile(targetFilePath)) continue
            console.log(fileChange.projectRelativePath)
            let fileResult = yield* analyzeFile(projectContext, targetFilePath, analysisOption)

            yield* writeStringToFile(
              './log/fileAnalysis.txt',
              JSON.stringify(fileResult.analysis, null, 2),
            )

            if (options?.buildTsDoc) {
              console.log('TSDoc Generate')
              yield* processTsDocUpdate(projectContext, fileResult, {
                debugInfo: {
                  JsDocUpdateContext: true,
                  JsDocUpdatePlan: true,
                  DumpToFile: true,
                },
                action: {
                  // NoLLMRequest: true,
                  // NoUpdateTSDoc: true,
                  // WriteToTempFolder: true,
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
              fileResult = yield* analyzeFile(projectContext, targetFilePath, analysisOption)
            }
            if (options?.commit || options?.recommit) {
              // Save FileAnalysis on project/.gyomu/<filePath>.json
              const fileAnalysisPath = join(
                projectAbsolutePath,
                '.gyomu',
                fileChange.projectRelativePath + '.json',
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
                fileChange.projectRelativePath + '.json',
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
        yield* buildDirectoryConcept(projectContext, {
          changedFiles: changeResult.diff,
          retryOption: {},
          debugInfo: {
            DumpToFile: true,
            DirectoryConcept: true,
          },
        })

        yield* buildPackageConcept(projectContext, {
          changedFiles: changeResult.diff,
          retryOption: {},
          debugInfo: {
            DumpToFile: true,
            PackageAnalysis: true,
            PackageConcept: true,
            PackageInsight: true,
          },
        })

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
