import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'

import { applyTranslations } from '../applyTranslations.js'
import { createTranslationPlan } from '../createTranslationPlan.js'

import type { Section, TranslationResult } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'

describe('applyTranslations', () => {
  const context: ReadmeBuildContext = {
    analysis: {
      package: {
        name: 'test-package',
      },
    },
  } as any

  const createSection = (): Section => ({
    id: 'overview',
    title: 'Overview',
    contents: [
      {
        type: 'paragraph',
        text: 'Paragraph',
      },
      {
        type: 'bullet-list',
        items: ['Item1', 'Item2'],
      },
      {
        type: 'code',
        language: 'ts',
        title: 'Example',
        code: 'console.log("hello")',
      },
    ],
  })

  it('applies translation to section title', async () => {
    const plan = createTranslationPlan('ja', [], [createSection()])

    const result: TranslationResult = [
      {
        id: 'overview.title',
        translation: '概要',
      },
    ]

    await Effect.runPromise(applyTranslations(context, plan, result))

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect(plan.destination[0]!.title).toBe('概要')
  })

  it('applies translation to paragraph', async () => {
    const plan = createTranslationPlan('ja', [], [createSection()])

    const result: TranslationResult = [
      {
        id: 'overview.contents.0.text',
        translation: '段落',
      },
    ]

    await Effect.runPromise(applyTranslations(context, plan, result))
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect(plan.destination[0]!.contents[0]).toEqual({
      type: 'paragraph',
      text: '段落',
    })
  })

  it('applies translation to bullet list item', async () => {
    const plan = createTranslationPlan('ja', [], [createSection()])

    const result: TranslationResult = [
      {
        id: 'overview.contents.1.items.1',
        translation: '二番目',
      },
    ]

    await Effect.runPromise(applyTranslations(context, plan, result))
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect(plan.destination[0]!.contents[1]).toEqual({
      type: 'bullet-list',
      items: ['Item1', '二番目'],
    })
  })

  it('applies translation to code title', async () => {
    const plan = createTranslationPlan('ja', [], [createSection()])

    const result: TranslationResult = [
      {
        id: 'overview.contents.2.title',
        translation: '使用例',
      },
    ]

    await Effect.runPromise(applyTranslations(context, plan, result))
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect(plan.destination[0]!.contents[2]).toEqual({
      type: 'code',
      language: 'ts',
      title: '使用例',
      code: 'console.log("hello")',
    })
  })

  it('throws when section does not exist', async () => {
    const plan = createTranslationPlan('ja', [], [createSection()])

    const result: TranslationResult = [
      {
        id: 'unknown.title',
        translation: 'AAA',
      },
    ]

    await expect(Effect.runPromise(applyTranslations(context, plan, result))).rejects.toThrow(
      'can not find target Seciton Id',
    )
  })

  it('throws when content does not exist', async () => {
    const plan = createTranslationPlan('ja', [], [createSection()])

    const result: TranslationResult = [
      {
        id: 'overview.contents.99.text',
        translation: 'AAA',
      },
    ]

    await expect(Effect.runPromise(applyTranslations(context, plan, result))).rejects.toThrow(
      'can not find target content',
    )
  })

  it('throws when content type does not match', async () => {
    const plan = createTranslationPlan('ja', [], [createSection()])

    const result: TranslationResult = [
      {
        id: 'overview.contents.0.title',
        translation: 'AAA',
      },
    ]

    await expect(Effect.runPromise(applyTranslations(context, plan, result))).rejects.toThrow(
      'should be code block',
    )
  })

  it('throws when item name is invalid', async () => {
    const plan = createTranslationPlan('ja', [], [createSection()])

    const result: TranslationResult = [
      {
        id: 'overview.contents.0.invalid',
        translation: 'AAA',
      },
    ]

    await expect(Effect.runPromise(applyTranslations(context, plan, result))).rejects.toThrow(
      'Invalid ItemName',
    )
  })
})
