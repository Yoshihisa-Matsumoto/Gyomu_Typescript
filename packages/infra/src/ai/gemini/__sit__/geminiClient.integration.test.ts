import { describe, it, expect } from 'vitest';
import { Effect, Stream } from 'effect';
import { GeminiClient, GeminiLayer } from '../GeminiClient.js';
import { makeRunner } from '../../../runtime.js';

const hasApiKey = !!process.env.GEMINI_API_KEY;
const runIntegration = process.env.RUN_INTEGRATION_TEST === 'true';
const runGeminiQAWithEnvOrThrow = makeRunner(GeminiLayer);
describe('GeminiClient (Integration)', () => {
  const testIf = hasApiKey && runIntegration ? it : it.skip;

  testIf('generateText: 実API呼び出し', async () => {
    const program = Effect.gen(function* () {
      const client = yield* GeminiClient;

      return yield* client.generateText({
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'Say hello in one word' }],
          },
        ],
      });
    });

    const result = await runGeminiQAWithEnvOrThrow(program);

    expect(result.length).toBeGreaterThan(0);
  });

  testIf('streamChat: 実APIストリーム', async () => {
    const program = Effect.gen(function* () {
      const client = yield* GeminiClient;

      const stream = client.streamChat({
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'Count to 3' }],
          },
        ],
      });

      return yield* Stream.runCollect(stream);
    });

    const result = await runGeminiQAWithEnvOrThrow(program);

    expect(result.length).toBeGreaterThan(0);
    console.log(result);
  });
});
