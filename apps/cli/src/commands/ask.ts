import { TsDocRouteId, listTypescriptProject } from '@gyomu/tsdoc'
import { AI_MODELS, AiModelRoute } from '@gyomu/ai'
import { Effect, Layer } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { makeRunner } from '@gyomu/schema/effect'
import { analyzeFile, initializeProjectContext } from '@gyomu/ts-analysis'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { createVercelAiLayer } from '@gyomu/ai/provider/vercel'
import { createAskPrompt } from '../prompts/askPrompt.js'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runQAWithEnvOrThrow = makeRunner(
  createVercelAiLayer(new Map([[TsDocRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }]])),
)
export const askCommand = (projectName: string, file: string) =>
  runQAWithEnvOrThrow(
    Effect.gen(function* () {
      const projects = yield* listTypescriptProject()
      const targetProject = projects.projects.find((p) => p.name == projectName)
      if (!targetProject) {
        console.log(`${projectName} Not Found`)
        return
      }
      const project = yield* initializeProjectContext({
        repoRoot: projects.repositoryRoot,
        projectRelativePath: targetProject.rootPath,
      })
      const fileAnalysisResult = yield* analyzeFile(project, ProjectRelativePath(file))

      const prompt = createAskPrompt({
        question: 'fromPromiseはEffect.tryPromiseと何が違う？',
        analysis: fileAnalysisResult,
      })
      const service = yield* AiModelRoute
      const result = yield* service.generateText({
        routeId: TsDocRouteId,
        key: 'fast',
        messages: [{ id: '1', role: MessageRole.user, content: prompt }],
      })
      console.log(`Prompt:${prompt}`)
      console.log(result.message.text)
    }),
    layer,
  )
