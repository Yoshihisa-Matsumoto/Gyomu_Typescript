import { describe, expect, test } from 'vitest'
import { Effect } from 'effect'
import { mergeTags } from '../mergeTags.js'

describe('mergeTags', () => {
  test('preserves existing tag', async () => {
    const result = await Effect.runPromise(
      mergeTags(
        'test.ts',
        [
          {
            tag: { kind: 'throws' },
            sortOrder: 1,
            action: {
              type: 'preserve',
            },
          },
        ] as any,
        {
          tags: [
            {
              tagName: 'throws',
              sortOrder: 1,
              text: 'Error when invalid',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([
      {
        tagName: 'throws',
        sortOrder: 1,
        text: 'Error when invalid',
      },
    ])
  })

  test('ignores preserve when tag does not exist', async () => {
    const result = await Effect.runPromise(
      mergeTags(
        'test.ts',
        [
          {
            tag: { kind: 'throws' },
            sortOrder: 1,
            action: {
              type: 'preserve',
            },
          },
        ] as any,
        {
          tags: [],
        } as any,
      ),
    )

    expect(result).toEqual([])
  })

  test('deletes tag', async () => {
    const result = await Effect.runPromise(
      mergeTags(
        'test.ts',
        [
          {
            tag: { kind: 'throws' },
            sortOrder: 1,
            action: {
              type: 'delete',
            },
          },
        ] as any,
        {
          tags: [
            {
              tagName: 'throws',
              sortOrder: 1,
              text: 'Error when invalid',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([])
  })

  test('replaces existing tag', async () => {
    const result = await Effect.runPromise(
      mergeTags(
        'test.ts',
        [
          {
            tag: { kind: 'throws' },
            sortOrder: 1,
            action: {
              type: 'replace',
              value: 'Updated error description',
            },
          },
        ] as any,
        {
          tags: [
            {
              tagName: 'throws',
              sortOrder: 1,
              text: 'Old error description',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([
      {
        tagName: 'throws',
        sortOrder: 1,
        text: 'Updated error description',
      },
    ])
  })

  test('creates new tag when replacing non-existing tag', async () => {
    const result = await Effect.runPromise(
      mergeTags(
        'test.ts',
        [
          {
            tag: { kind: 'throws' },
            sortOrder: 1,
            action: {
              type: 'replace',
              value: 'Error when invalid',
            },
          },
        ] as any,
        {
          tags: [],
        } as any,
      ),
    )

    expect(result).toEqual([
      {
        tagName: 'throws',
        sortOrder: 1,
        text: 'Error when invalid',
      },
    ])
  })
  test('preserves tag matched by key', async () => {
    const result = await Effect.runPromise(
      mergeTags(
        'test.ts',
        [
          {
            tag: {
              kind: 'throws',
              key: 'ValidationError',
            },
            sortOrder: 1,
            action: {
              type: 'preserve',
            },
          },
        ] as any,
        {
          tags: [
            {
              tagName: 'throws',
              key: 'ValidationError',
              sortOrder: 1,
              text: 'Validation error',
            },
            {
              tagName: 'throws',
              key: 'NetworkError',
              sortOrder: 2,
              text: 'Network error',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([
      {
        tagName: 'throws',
        key: 'ValidationError',
        sortOrder: 1,
        text: 'Validation error',
      },
    ])
  })
  test('replaces tag matched by key', async () => {
    const result = await Effect.runPromise(
      mergeTags(
        'test.ts',
        [
          {
            tag: {
              kind: 'throws',
              key: 'ValidationError',
            },
            sortOrder: 1,
            action: {
              type: 'replace',
              value: 'Updated validation error',
            },
          },
        ] as any,
        {
          tags: [
            {
              tagName: 'throws',
              key: 'ValidationError',
              sortOrder: 1,
              text: 'Old validation error',
            },
            {
              tagName: 'throws',
              key: 'NetworkError',
              sortOrder: 2,
              text: 'Network error',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([
      {
        tagName: 'throws',
        // key: 'ValidationError',
        sortOrder: 1,
        text: 'Updated validation error',
      },
    ])
  })
  test('does not preserve when key does not match', async () => {
    const result = await Effect.runPromise(
      mergeTags(
        'test.ts',
        [
          {
            tag: {
              kind: 'throws',
              key: 'UnknownError',
            },
            sortOrder: 1,
            action: {
              type: 'preserve',
            },
          },
        ] as any,
        {
          tags: [
            {
              tagName: 'throws',
              key: 'ValidationError',
              sortOrder: 1,
              text: 'Validation error',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([])
  })
  test('matches tags without key for backward compatibility', async () => {
    const result = await Effect.runPromise(
      mergeTags(
        'test.ts',
        [
          {
            tag: {
              kind: 'throws',
            },
            sortOrder: 1,
            action: {
              type: 'preserve',
            },
          },
        ] as any,
        {
          tags: [
            {
              tagName: 'throws',
              sortOrder: 1,
              text: 'Validation error',
            },
          ],
        } as any,
      ),
    )

    expect(result).toEqual([
      {
        tagName: 'throws',
        sortOrder: 1,
        text: 'Validation error',
      },
    ])
  })
})
