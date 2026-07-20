import { Effect } from 'effect'
import { withOptional } from '@gyomu/schema'
import { UpdateError } from '../error/UpdateError.js'
import type { JsDocParam, ParsedJsDoc } from '@gyomu/schema/schemas/typescript'
import type { MergePlan } from '../jsdoc/MergePlan.js'

type PlanParamList = MergePlan['params']
type PlanParam = MergePlan['params'][number]
export const mergeParams = (
  filePath: string,
  plans: PlanParamList,
  existingJsDoc?: ParsedJsDoc,
): Effect.Effect<Array<JsDocParam>, UpdateError> => {
  return Effect.forEach((param: PlanParam) =>
    Effect.gen(function* () {
      const existingParam = existingJsDoc?.params.find((p) => p.name == param.name)
      switch (param.action.type) {
        case 'preserve':
          return existingParam
        case 'delete':
          return undefined
        case 'replace':
          if (!existingParam && !param.action.value.type && !param.action.value.description) {
            return yield* Effect.fail(
              new UpdateError({
                cause: undefined,
                filePath,
                message: `Planned Param does not have valid parameter`,
                details: { plannedParameter: param },
                phase: 'update-plan',
              }),
            )
          }
          return yield* Effect.succeed({
            name: param.name,
            sortOrder: param.sortOrder,
            ...withOptional({
              type: param.action.value.type ?? existingParam?.type,
              description: param.action.value.description ?? existingParam?.description ?? '',
            }),
          } satisfies JsDocParam)
      }
    }),
  )(plans).pipe(Effect.map((params) => params.filter((p): p is JsDocParam => p !== undefined)))
}
