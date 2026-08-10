import { Effect } from 'effect'
import { expect, it } from 'vitest'
import { makeRunner } from '@gyomu/schema/effect'
import { PlatformLayer } from '@gyomu/infra'
import { buildOverviewMessages } from '../buildOverviewMessages.js'

it('buildOverviewMessages', async () =>
  await makeRunner(PlatformLayer)(
    Effect.gen(function* () {
      const context = {
        knowledge: {
          package: {
            mission: 'Mission',
          },
        },
        concept: {
          summary: 'summary',
        },
      } as any
      const messages = yield* buildOverviewMessages(context)

      expect(messages).toEqual([
        {
          id: '1',
          role: 'system',
          content: expect.stringContaining('Repository Overview'),
        },
        {
          id: '2',
          role: 'user',
          content: expect.stringContaining('Mission'),
        },
      ])

      expect(messages).toEqual([
        {
          id: '1',
          role: 'system',
          content: expect.stringContaining(
            'The purpose of this section is to establish a concise conceptual understanding of the package before the reader proceeds to the remainin',
          ),
        },
        {
          id: '2',
          role: 'user',
          content: expect.stringContaining('summary'),
        },
      ])
    }),
  ))
