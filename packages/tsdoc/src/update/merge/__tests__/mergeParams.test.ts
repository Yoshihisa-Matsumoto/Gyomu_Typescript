import { describe, expect, test } from 'vitest'
import { Effect } from 'effect'
import { mergeParams } from '../mergeParams.js'

describe('mergeParams', () => {
  test('preserves existing parameter', async () => {
    const result = await Effect.runPromise(
      mergeParams(
        'test.ts',
        [
          {
            name: 'id',
            sortOrder: 1,
            action: { type: 'preserve' },
          },
        ] as any,
        {
          params: [
            {
              name: 'id',
              sortOrder: 1,
              type: 'string',
              description: 'User id',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([
      {
        name: 'id',
        sortOrder: 1,
        type: 'string',
        description: 'User id',
      },
    ])
  })
  test('ignores preserve when parameter does not exist', async () => {
    const result = await Effect.runPromise(
      mergeParams(
        'test.ts',
        [
          {
            name: 'id',
            sortOrder: 1,
            action: { type: 'preserve' },
          },
        ] as any,
        {
          params: [],
        } as any,
      ),
    )

    expect(result).toEqual([])
  })
  test('deletes parameter', async () => {
    const result = await Effect.runPromise(
      mergeParams(
        'test.ts',
        [
          {
            name: 'id',
            sortOrder: 1,
            action: { type: 'delete' },
          },
        ] as any,
        {
          params: [
            {
              name: 'id',
              sortOrder: 1,
              description: 'User id',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([])
  })
  test('replaces parameter description', async () => {
    const result = await Effect.runPromise(
      mergeParams(
        'test.ts',
        [
          {
            name: 'id',
            sortOrder: 1,
            action: {
              type: 'replace',
              value: {
                description: 'Updated description',
              },
            },
          },
        ] as any,
        {
          params: [
            {
              name: 'id',
              sortOrder: 1,
              type: 'string',
              description: 'Old description',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([
      {
        name: 'id',
        sortOrder: 1,
        type: 'string',
        description: 'Updated description',
      },
    ])
  })
  test('replaces parameter type', async () => {
    const result = await Effect.runPromise(
      mergeParams(
        'test.ts',
        [
          {
            name: 'id',
            sortOrder: 1,
            action: {
              type: 'replace',
              value: {
                type: 'UserId',
              },
            },
          },
        ] as any,
        {
          params: [
            {
              name: 'id',
              sortOrder: 1,
              type: 'string',
              description: 'User id',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([
      {
        name: 'id',
        sortOrder: 1,
        type: 'UserId',
        description: 'User id',
      },
    ])
  })
  test('add new item ', async () => {
    const result = await Effect.runPromise(
      mergeParams(
        'test.ts',
        [
          {
            name: 'id',
            sortOrder: 1,
            action: {
              type: 'replace',
              value: {
                type: 'string',
                description: 'User id',
              },
            },
          },
        ] as any,
        {
          params: [],
        } as any,
      ),
    )

    expect(result).toEqual([
      {
        name: 'id',
        sortOrder: 1,
        type: 'string',
        description: 'User id',
      },
    ])
  })
  test('fails when replacing missing type parameter', async () => {
    const exit = await Effect.runPromiseExit(
      mergeParams(
        'test.ts',
        [
          {
            name: 'id',
            sortOrder: 1,
            action: {
              type: 'replace',
              value: {},
            },
          },
        ] as any,
        {
          params: [],
        } as any,
      ),
    )

    expect(exit._tag).toBe('Failure')
  })
  test('fails when replacing missing description parameter', async () => {
    const exit = await Effect.runPromiseExit(
      mergeParams(
        'test.ts',
        [
          {
            name: 'id',
            sortOrder: 1,
            action: {
              type: 'replace',
              value: {},
            },
          },
        ] as any,
        {
          params: [],
        } as any,
      ),
    )

    expect(exit._tag).toBe('Failure')
  })
})
