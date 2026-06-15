// import { join } from 'node:path'
// import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'
// import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
// import { makeRunner } from '@gyomu/schema/effect'
// import { Effect, Layer } from 'effect'
// import { describe, it } from 'vitest'
// import { Project } from 'ts-morph'

// import 'dotenv/config'
// import { processTsDocUpdate } from '../processTsDocUpdate.js'

// const timeout = 30000
// const describeIfProjectName =
//   process.env.TSDOC_PROJECT && process.env.TSDOC_FILE ? describe : describe.skip

// const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
// const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)

// const processTsDocUpdateProgram = () => {
//   const projectRoot = process.env.TSDOC_PROJECT!
//   const sourceFilename = process.env.TSDOC_FILE!
//   const project = new Project({
//     tsConfigFilePath: join(projectRoot, 'tsconfig.json'),
//   })
//   const projectName = '@gyomu/ai-compiler'

//   const filePath = join(projectRoot, sourceFilename)
//   const program = Effect.gen(function* () {
//     const result = yield* processTsDocUpdate({ project, projectRoot, projectName }, filePath, {
//       includeDebugInfo: true,
//     })
//     console.dir(result, { depth: null })
//   })
//   return runQAWithEnvOrThrow(program, layer)
// }
// describeIfProjectName('processTsDocUpdate real test', () => {
//   it(
//     'test',
//     async () => {
//       const plan = await processTsDocUpdateProgram()
//     },
//     timeout,
//   )
// })
