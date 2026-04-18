import { Effect } from 'effect';
import { describe, it, expect } from 'vitest';
import { RuntimeContext } from '../../shared/runtime/runtimeContext.js';
import { RuntimeContextLive } from '../runtime/runtimeContextLive.js';

describe('RuntimeContextLive', () => {
  it('Layerとして取得できる', async () => {
    const program = Effect.gen(function* () {
      return yield* RuntimeContext;
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(RuntimeContextLive)),
    );

    expect(result).toHaveProperty('machineName');
    expect(result).toHaveProperty('address');
    expect(result).toHaveProperty('pid');
  });
});
