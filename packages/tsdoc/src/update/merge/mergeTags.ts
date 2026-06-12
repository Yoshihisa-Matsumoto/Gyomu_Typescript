import { Effect } from 'effect'
import { withOptional } from '@gyomu/schema'
import type { ParsedJsDoc, ParsedTag } from '@gyomu/schema/typescript'
import type { MergePlan } from '../jsdoc/MergePlan.js'

type PlanTagList = MergePlan['tags']
type PlanTag = MergePlan['tags'][number]

export const mergeTags = (
  filePath: string,
  plans: PlanTagList,
  existingJsDoc?: ParsedJsDoc,
): Effect.Effect<Array<ParsedTag>> => {
  return Effect.forEach((tag: PlanTag) =>
    Effect.gen(function* () {
      switch (tag.action.type) {
        case 'preserve': {
          const existingTag = existingJsDoc?.tags.find(
            (t) => t.tagName == tag.tag.kind && (t.key == tag.tag.key || (!t.key && !tag.tag.key)),
          )
          return existingTag
        }
        case 'delete':
          return undefined
        case 'replace':
          return yield* Effect.succeed({
            tagName: tag.tag.kind,
            ...withOptional({ key: tag.tag.key }),
            sortOrder: tag.sortOrder,
            text: tag.action.value,
          } satisfies ParsedTag)
      }
    }),
  )(plans).pipe(Effect.map((params) => params.filter((p): p is ParsedTag => p !== undefined)))
}
