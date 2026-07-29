import { Effect } from 'effect'
import { expect, it } from 'vitest'
import { makeRunner } from '@gyomu/schema/effect'
import { PlatformLayer } from '@gyomu/infra'
import { buildDevelopmentMessages } from '../buildDevelopmentMessages.js'

it('buildDependenciesMessages', async () =>
  await makeRunner(PlatformLayer)(
    Effect.gen(function* () {
      const context = {
        knowledge: {
          package: {
            mission: 'Mission',
            policies: ['abc'],
          },
        },
        concept: {
          responsibilities: ['Responsibility!!'],
        },
      } as any
      const messages = yield* buildDevelopmentMessages(context)

      expect(messages).toEqual([
        {
          id: '1',
          role: 'user',
          content: expect.stringContaining('the provided mission to explain the '),
        },
      ])
      expect(messages).toEqual([
        {
          id: '1',
          role: 'user',
          content: expect.stringContaining('Mission'),
        },
      ])
      expect(messages).toEqual([
        {
          id: '1',
          role: 'user',
          content: expect.stringContaining('Responsibility!!'),
        },
      ])
    }),
  ))
