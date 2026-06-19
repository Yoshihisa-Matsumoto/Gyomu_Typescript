import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { makeRunner } from '@gyomu/schema/effect'
import { analyzeProjectChanges, listTypescriptProject } from '@gyomu/tsdoc'
import { Effect, Layer } from 'effect'
import {} from 'dotenv/config'
import { FileSearchServiceLayer } from '@gyomu/infra/fs'

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
      console.dir(changeResult.currentSnapshot, { depth: null })
    }),
    layer,
  )
}
