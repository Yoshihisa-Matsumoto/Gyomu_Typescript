import { Effect } from 'effect'
import type { ParsedJsDoc, ParsedTag } from '@gyomu/schema/schemas/typescript'
import type { MergePlan } from '../jsDoc/MergePlan.js'

type PlanTagList = MergePlan['tags']
type PlanTag = MergePlan['tags'][number]

/**
 * Merges a list of tag update plans with existing JSDoc tags, producing a finalized array of parsed tags based on the provided actions.
 *
 * @param filePath The path to the file containing the documentation.
 *
 * @param plans The collection of tag update operations to apply.
 *
 * @param existingJsDoc Optional existing parsed JSDoc structure to merge against.
 *
 * @returns An Effect that resolves to the array of merged and filtered JSDoc tags.
 */
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
            (t) =>
              (tag.tag.kind == 'other' ? t.tagName == tag.tag.key : t.tagName == tag.tag.kind) &&
              (tag.tag.kind != 'other' ? t.key == tag.tag.key || (!t.key && !tag.tag.key) : !t.key),
          )
          return existingTag
        }
        case 'delete':
          return undefined
        case 'replace':
          return yield* Effect.succeed({
            tagName: tag.tag.kind == 'other' ? (tag.tag.key ?? '') : tag.tag.kind,
            // ...withOptional({ key: tag.tag.key ?? undefined }),
            sortOrder: tag.sortOrder,
            text: tag.action.value,
          } satisfies ParsedTag)
      }
    }),
  )(plans).pipe(Effect.map((params) => params.filter((p): p is ParsedTag => p !== undefined)))
}
