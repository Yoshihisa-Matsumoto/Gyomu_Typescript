import { Effect } from 'effect'
import { expect, it } from 'vitest'
import { makeRunner } from '@gyomu/schema/effect'
import { PlatformLayer } from '@gyomu/infra'
import { buildDependenciesMessages } from '../buildDependenciesMessages.js'

it('buildDependenciesMessages', async () =>
  await makeRunner(PlatformLayer)(
    Effect.gen(function* () {
      const context = {
        knowledge: {
          technical: {
            dependencies: ['Mission'],
            compatibility: ['abca'],
          },
        },
      } as any
      const messages = yield* buildDependenciesMessages(context)

      expect(messages).toEqual([
        {
          id: '1',
          role: 'system',
          content: expect.stringContaining('You are'),
        },
        {
          id: '2',
          role: 'user',
          content: expect.stringContaining('Mission'),
        },
      ])
    }),
  ))
