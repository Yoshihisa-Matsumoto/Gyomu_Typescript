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
import { buildDirectoryConcept } from '@gyomu/concept/directory'
import { buildPackageConcept } from '@gyomu/concept/package'
import { DocumentSectionRouteId, generateReadmeFiles } from '@gyomu/concept/readme'
import { generateLlmContextFile } from '@gyomu/concept/llm-context'
import { Effect, Layer } from 'effect'

import {
  FileSearchServiceLayer,
  createPathMatcher,
  makeDirectory,
  removePath,
  writeStringToFile,
} from '@gyomu/infra/fs'
import {
  analyzeFile,
  initializeProjectContext,
  listTypescriptProject,
  saveFileAnalysis,
} from '@gyomu/ts-analysis'
import { AI_MODELS } from '@gyomu/ai'
import { loadCheckpoint, updateCheckpoint } from './internals/checkpoint.js'
import type { AnalysisOptions, FullPath } from '@gyomu/schema'
import type { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import type { Checkpoint, PipelineStep } from '../schemas/Checkpoint.js'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(
  Layer.provideMerge(PlatformLayer),
  Layer.provideMerge(FileSearchServiceLayer),
)
const runQAWithEnvOrThrow = makeRunner(
  createVercelAiLayer(
    new Map([
      [TsDocRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }],
      [DocumentSectionRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }],
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
          trace: true,
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

        yield* removePath(join(projectAbsolutePath, '.gyomu', 'cache'), { recursive: true })
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

      // console.dir(projectContext, { depth: null })
      // console.dir(projectContext.includedFiles.keys().toArray())

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
              yield* saveFileAnalysis(projectContext, fileResult.analysis)
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

        let currentCheckpoint = yield* loadCheckpoint(
          changeResult,
          projectName,
          projects.repositoryRoot,
          targetProject.rootPath,
        )

        yield* commitProjectSnapshot({
          expectedSnapshot: changeResult.currentSnapshot,
          projectPath: targetProject.rootPath,
          repoRoot: projects.repositoryRoot,
        })

        if (!currentCheckpoint.completedSteps.includes('directoryConcept')) {
          yield* buildDirectoryConcept(projectContext, {
            changedFiles: changeResult.diff,
            retryOption: {},
            debugInfo: {
              DumpToFile: true,
              DirectoryConcept: true,
            },
          })
          currentCheckpoint = yield* updateSnapshot(
            projects.repositoryRoot,
            targetProject.rootPath,
            currentCheckpoint,
            'directoryConcept',
          )
          // changeResult = yield* analyzeProjectChanges({
          //   repoRoot: projects.repositoryRoot,
          //   projectPath: targetProject.rootPath,
          // })
          // yield* commitProjectSnapshot({
          //   expectedSnapshot: changeResult.currentSnapshot,
          //   projectPath: targetProject.rootPath,
          //   repoRoot: projects.repositoryRoot,
          // })
          // currentCheckpoint = yield* updateCheckpoint(
          //   currentCheckpoint,
          //   projects.repositoryRoot,
          //   targetProject.rootPath,
          //   'directoryConcept',
          // )
        }

        if (!currentCheckpoint.completedSteps.includes('packageConcept')) {
          yield* buildPackageConcept(projectContext, {
            changedFiles: changeResult.diff,
            retryOption: {},
            debugInfo: {
              DumpToFile: true,
              PackageAnalysis: true,
              PackageConcept: true,
            },
          })
          currentCheckpoint = yield* updateSnapshot(
            projects.repositoryRoot,
            targetProject.rootPath,
            currentCheckpoint,
            'packageConcept',
          )
        }

        if (!currentCheckpoint.completedSteps.includes('README')) {
          yield* generateReadmeFiles(projectContext, {
            retryOption: {},
            debugInfo: {
              DumpToFile: true,
              PackageAnalysis: true,
              ReadmeSections: true,
            },
          })
          currentCheckpoint = yield* updateSnapshot(
            projects.repositoryRoot,
            targetProject.rootPath,
            currentCheckpoint,
            'README',
          )
        }

        if (!currentCheckpoint.completedSteps.includes('LLMContext')) {
          yield* generateLlmContextFile(projectContext, { retryOption: {} })
          currentCheckpoint = yield* updateSnapshot(
            projects.repositoryRoot,
            targetProject.rootPath,
            currentCheckpoint,
            'LLMContext',
          )
        }
        // yield* commitProjectSnapshot({
        //   expectedSnapshot: changeResult.currentSnapshot,
        //   projectPath: targetProject.rootPath,
        //   repoRoot: projects.repositoryRoot,
        // })
        console.log(`Completed: ${JSON.stringify(currentCheckpoint.completedSteps)}`)
      }
    }),
    layer,
  )
}

const updateSnapshot = (
  repositoryRoot: FullPath,
  projectPath: WorkspaceRelativePath,
  currentCheckpoint: Checkpoint,
  statusToAdd: PipelineStep,
) =>
  Effect.gen(function* () {
    const changeResult = yield* analyzeProjectChanges({
      repoRoot: repositoryRoot,
      projectPath,
    })
    yield* commitProjectSnapshot({
      expectedSnapshot: changeResult.currentSnapshot,
      projectPath,
      repoRoot: repositoryRoot,
    })
    return yield* updateCheckpoint(currentCheckpoint, repositoryRoot, projectPath, statusToAdd)
  })
