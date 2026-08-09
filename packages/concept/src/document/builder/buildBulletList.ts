import { buildSectionObject } from '@gyomu/ai-compiler/document'
import { Effect } from 'effect'
import { GeneratedBulletList } from '../schemas/GeneratedBulletList.js'
import type { GeneratedBulletListItem } from '../schemas/GeneratedBulletList.js'
import type { BulletList, BulletListItem } from '@gyomu/schema/schemas/document'
import type { SectionPromptProvider } from '@gyomu/ai-compiler/document'
import type { AiError, IOError, RetryOption } from '@gyomu/schema'
import type { AiModelRoute, ModelRoutes, RouteNotFoundError } from '@gyomu/ai'

const createTranslationIdGenerator = () => {
  let nextId = 0

  return () => ++nextId
}

const toBulletList = (
  generated: GeneratedBulletList,
  createTranslationId: () => number,
): BulletList => ({
  type: 'bullet-list',
  items: generated.items.map((item) => toBulletListItem(item, createTranslationId)),
})

const toBulletListItem = (
  item: GeneratedBulletListItem,
  createTranslationId: () => number,
): BulletListItem => ({
  translationId: createTranslationId(),
  text: item.text,
  children: item.children?.map((child) => toBulletListItem(child, createTranslationId)),
})

/**
 * Constructs a bullet list for the specified section by utilizing the provided section prompt provider.
 *
 * @param sectionId The unique identifier for the section.
 *
 * @param context The context object required by the provider.
 *
 * @param provider The provider used to generate the section content.
 *
 * @param retryOption Optional retry settings.
 *
 * @returns An Effect that resolves to a BulletList, potentially failing with an IOError, AiError, or RouteNotFoundError, and requiring R, AiModelRoute, and ModelRoutes services.
 */
export const buildBulletList = <TSectionId extends string, TContext, R = never>(
  sectionId: TSectionId,
  context: TContext,
  provider: SectionPromptProvider<TSectionId, TContext, R>,
  retryOption?: RetryOption,
): Effect.Effect<
  BulletList,
  IOError | AiError | RouteNotFoundError,
  R | AiModelRoute | ModelRoutes
> =>
  Effect.gen(function* () {
    const generatedBulletList = yield* buildSectionObject(
      sectionId,
      context,
      provider,
      GeneratedBulletList,
      retryOption,
    )
    return toBulletList(generatedBulletList, createTranslationIdGenerator())
  })
