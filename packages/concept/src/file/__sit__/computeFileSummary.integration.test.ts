// import path from 'node:path'
// import { createFixtureProject } from '../__tests__/createFixtureProject.js'
// import { Effect, Layer } from 'effect'
// import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
// import { makeRunner } from '@gyomu/schema/effect'
// import { createVercelAiLayer } from '@gyomu/ai/provider/vercel'
// import { FileSummaryRouteId } from '@gyomu/ai-compiler/file-summary'
// import { ProjectRelativePath } from '@gyomu/schema/typescript'
// import { analyzeFile } from '@gyomu/ts-analysis'
// import { computeFileSummary } from '../computeFileSummary.js'
// import { AI_MODELS } from '@gyomu/ai'
import { describe, test } from 'vitest'

// const fileFixture = createFixtureProject(path.join('summary', 'simple'))

// const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
// const runQAWithEnvOrThrow = makeRunner(
//   createVercelAiLayer(
//     new Map([[FileSummaryRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }]]),
//   ),
// )

// const createFileSummaryProgram = (sourceFile: string) => {
//   const filePath = ProjectRelativePath(path.join('src', sourceFile))
//   const program = Effect.gen(function* () {
//     const result = yield* analyzeFile(fileFixture, filePath, {
//       // includeDebugInfo: true,
//     })
//     // console.dir(result, { depth: null })
//     const summary = yield* computeFileSummary(result, {
//       debugInfo: { FileSummaryInput: true },
//       action: {},
//       retryOption: {},
//     })
//     console.log(summary)
//     return summary
//   })
//   return runQAWithEnvOrThrow(program, layer)
// }

describe('File Summary Integration', () => {
  //   test('simple', async () => {
  //     await createFileSummaryProgram('main.ts')
  //   })
})
