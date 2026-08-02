/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, expect, it } from 'vitest'
import { Effect, Result } from 'effect'
import { TranslationError } from '@gyomu/schema'
import { updateBulletListContext } from '../BulletListTranslationStrategy.js'
import type { BulletList } from '@gyomu/schema/schemas/document'

const createBulletList = (): BulletList => ({
  type: 'bullet-list',
  items: [
    {
      translationId: 1,
      text: 'Original 1',
    },
    {
      translationId: 2,
      text: 'Original 2',
    },
    {
      translationId: 3,
      text: 'Original 3',
      children: [
        {
          translationId: 4,
          text: 'Original 4',
        },
      ],
    },
  ],
})

describe('BulletListTranslationStrategy', () => {
  it('updates only valid bullet list items from translated context', async () => {
    const originalContext = createBulletList()

    const translatedContext: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'Translated 1',
        },
        {
          translationId: 2,
          text: 'Translated 2',
        },
        {
          translationId: 3,
          text: 'Translated 3',
          children: [
            {
              translationId: 4,
              text: 'Translated 4',
            },
          ],
        },
      ],
    }

    const result = await updateBulletListContext({
      sectionId: 'test-section',
      sectionDefinition: {} as any,
      currentValidation: {
        issues: [
          {
            code: 'INVALID',
            translationId: 2,
            message: 'invalid',
            repairInstruction: 'invalid',
          },
        ],
        isValid: false,
      },
      previousValidation: undefined,
      originalContext,
      translatedContext,
    }).pipe(Effect.runPromise)

    expect(result.context.items[0]!.text).toBe('Translated 1')
    expect(result.context.items[1]!.text).toBe('Original 2')
    expect(result.context.items[2]!.text).toBe('Translated 3')
    expect(result.context.items[2]!.children?.[0]!.text).toBe('Translated 4')
  })

  it('keeps previous successful items when previous validation exists', async () => {
    const originalContext = createBulletList()

    const translatedContext = {
      type: 'bullet-list' as const,
      items: [
        {
          translationId: 1,
          text: 'Translated 1',
        },
        {
          translationId: 2,
          text: 'Translated 2',
        },
        {
          translationId: 3,
          text: 'Translated 3',
          children: [
            {
              translationId: 4,
              text: 'Translated 4',
            },
          ],
        },
      ],
    }

    const result = await updateBulletListContext({
      sectionId: 'test-section',
      sectionDefinition: {} as any,
      currentValidation: {
        issues: [
          {
            code: 'INVALID',
            translationId: 2,
            message: 'invalid',
            repairInstruction: 'invalid',
          },
        ],
        isValid: false,
      },
      previousValidation: {
        issues: [
          {
            code: 'INVALID',
            translationId: 1,
            message: 'invalid',
            repairInstruction: 'invalid',
          },
          {
            code: 'INVALID',
            translationId: 2,
            message: 'invalid',
            repairInstruction: 'invalid',
          },
        ],
        isValid: false,
      },
      originalContext,
      translatedContext,
    }).pipe(Effect.result, Effect.runPromise)

    if (Result.isSuccess(result)) {
      const context = result.success
      // console.dir(context)
      expect(context.context.items[2]!.text).toBe('Original 3')
      expect(context.context.items[2]!.children![0]!.text).toBe('Original 4')
      expect(context.context.items[0]!.text).toBe('Translated 1')
    } else {
      const error = result.failure
      console.dir(error)
      expect(Result.isSuccess(result)).toBeTruthy()
    }
  })
  it('throws TranslationError when translationId does not exist', async () => {
    const originalContext = createBulletList()

    const translatedContext = createBulletList()

    await expect(
      updateBulletListContext({
        sectionId: 'test-section',
        sectionDefinition: { id: 'test' } as any,
        currentValidation: {
          issues: [],
          isValid: true,
        },
        previousValidation: undefined,
        originalContext,
        translatedContext: {
          type: 'bullet-list',
          items: [
            {
              translationId: 999,
              text: 'Unknown',
            },
          ],
        },
      }).pipe(Effect.runPromise),
    ).rejects.toBeInstanceOf(TranslationError)
  })
  it('does not update any item when all previous invalid items are still invalid', async () => {
    const originalContext = createBulletList()

    const translatedContext = {
      type: 'bullet-list' as const,
      items: [
        {
          translationId: 1,
          text: 'Translated 1',
        },
        {
          translationId: 2,
          text: 'Translated 2',
        },
      ],
    }

    const result = await updateBulletListContext({
      sectionId: 'test-section',
      sectionDefinition: {} as any,
      currentValidation: {
        issues: [
          {
            code: 'INVALID',
            translationId: 1,
            message: 'invalid',
            repairInstruction: 'invalid',
          },
          {
            code: 'INVALID',
            translationId: 2,
            message: 'invalid',
            repairInstruction: 'invalid',
          },
        ],
        isValid: false,
      },
      previousValidation: {
        issues: [
          {
            code: 'INVALID',
            translationId: 1,
            message: 'invalid',
            repairInstruction: 'invalid',
          },
          {
            code: 'INVALID',
            translationId: 2,
            message: 'invalid',
            repairInstruction: 'invalid',
          },
        ],
        isValid: false,
      },
      originalContext,
      translatedContext,
    }).pipe(Effect.result, Effect.runPromise)

    expect(Result.isSuccess(result)).toBe(true)

    if (Result.isSuccess(result)) {
      expect(result.success.context.items[0]!.text).toBe('Original 1')
      expect(result.success.context.items[1]!.text).toBe('Original 2')
    }
  })
  it('updates only valid nested child item', async () => {
    const originalContext = createBulletList()

    const translatedContext = {
      type: 'bullet-list' as const,
      items: [
        {
          translationId: 3,
          text: 'Translated 3',
          children: [
            {
              translationId: 4,
              text: 'Translated 4',
            },
          ],
        },
      ],
    }

    const result = await updateBulletListContext({
      sectionId: 'test-section',
      sectionDefinition: {} as any,
      currentValidation: {
        issues: [],
        isValid: true,
      },
      previousValidation: {
        issues: [
          {
            code: 'INVALID',
            translationId: 4,
            message: 'invalid',
            repairInstruction: 'invalid',
          },
        ],
        isValid: false,
      },
      originalContext,
      translatedContext,
    }).pipe(Effect.result, Effect.runPromise)

    expect(Result.isSuccess(result)).toBe(true)

    if (Result.isSuccess(result)) {
      expect(result.success.context.items[2]!.children![0]!.text).toBe('Translated 4')

      expect(result.success.context.items[2]!.text).toBe('Original 3')
    }
  })
  it('does not update items when previous validation has global invalid issue', async () => {
    const originalContext = createBulletList()

    const translatedContext: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 1,
          text: 'Translated 1',
        },
        {
          translationId: 2,
          text: 'Translated 2',
        },
        {
          translationId: 3,
          text: 'Translated 3',
          children: [
            {
              translationId: 4,
              text: 'Translated 4',
            },
          ],
        },
      ],
    }

    const result = await updateBulletListContext({
      sectionId: 'test-section',
      sectionDefinition: {} as any,
      currentValidation: {
        issues: [
          {
            code: 'INVALID',
            translationId: undefined,
            message: 'global invalid',
            repairInstruction: 'retry all',
          },
        ],
        isValid: false,
      },
      previousValidation: {
        issues: [
          {
            code: 'INVALID',
            translationId: undefined,
            message: 'global invalid',
            repairInstruction: 'retry all',
          },
        ],
        isValid: false,
      },
      originalContext,
      translatedContext,
    }).pipe(Effect.result, Effect.runPromise)

    expect(Result.isSuccess(result)).toBe(true)

    if (Result.isSuccess(result)) {
      const context = result.success

      expect(context.context.items[0]!.text).toBe('Original 1')
      expect(context.context.items[1]!.text).toBe('Original 2')
      expect(context.context.items[2]!.text).toBe('Original 3')
      expect(context.context.items[2]!.children![0]!.text).toBe('Original 4')
    }
  })
  it('throws TranslationError when translated context does not contain valid translationId', async () => {
    const originalContext = createBulletList()

    const translatedContext: BulletList = {
      type: 'bullet-list',
      items: [
        {
          translationId: 2,
          text: 'Translated 2',
        },
      ],
    }

    const result = await updateBulletListContext({
      sectionId: 'test-section',
      sectionDefinition: {} as any,
      currentValidation: {
        issues: [],
        isValid: true,
      },
      previousValidation: {
        issues: [
          {
            code: 'INVALID',
            translationId: 1,
            message: 'invalid',
            repairInstruction: 'retry',
          },
        ],
        isValid: false,
      },
      originalContext,
      translatedContext,
    }).pipe(Effect.result, Effect.runPromise)

    expect(Result.isFailure(result)).toBe(true)

    if (Result.isFailure(result)) {
      expect(result.failure).toMatchObject({
        contentType: 'bullet-list',
        phase: 'retry-context',
        translationId: 1,
      })
    }
  })
})
