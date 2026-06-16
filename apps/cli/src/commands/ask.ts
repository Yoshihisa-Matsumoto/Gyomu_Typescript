import { analyzeFile, initializeProjectContext } from '@gyomu/tsdoc'
import { AI_MODELS, AiModelService } from '@gyomu/ai'
import { Effect, Layer } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'
import { makeRunner } from '@gyomu/schema/effect'
import { createAskPrompt } from '../prompts/askPrompt.js'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)
export const askCommand = (projectRootPath: string, file: string) =>
  runQAWithEnvOrThrow(
    Effect.gen(function* () {
      const project = yield* initializeProjectContext(projectRootPath)
      const fileAnalysisResult = yield* analyzeFile(project, file)

      const prompt = createAskPrompt({
        question: 'fromPromiseはEffect.tryPromiseと何が違う？',
        analysis: fileAnalysisResult,
      })
      const service = yield* AiModelService
      const result = yield* service.generateText({
        model: AI_MODELS.fast,
        messages: [{ id: '1', role: MessageRole.user, content: prompt }],
      })
      console.log(`Prompt:${prompt}`)
      console.log(result.message.text)
    }),
    layer,
  )
