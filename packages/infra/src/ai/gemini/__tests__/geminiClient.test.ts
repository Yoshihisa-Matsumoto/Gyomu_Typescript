import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Effect, Layer, Stream } from 'effect';
import { GeminiClient } from '../GeminiClient.js';
import { ConfigService } from '../../../config.js';
import { AIError } from '@gyomu/core';
import { makeRunner } from '../../../runtime.js';
import { PlatformLayer } from '../../../layer.js';

// --- モック定義 ---
const generateContentMock = vi.fn();
const generateContentStreamMock = vi.fn();

vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    models = {
      generateContent: generateContentMock,
      generateContentStream: generateContentStreamMock,
    };

    constructor() {}
  }

  return {
    GoogleGenAI: MockGoogleGenAI,
    ToolType: {
      TOOL_TYPE_UNSPECIFIED: 0,
    },
  };
});
// --- ConfigServiceモック ---
const MockConfigLayer = Layer.succeed(ConfigService, {
  load: () =>
    Effect.succeed({
      apiKey: 'dummy',
    }),
} as any);

const geminiTestLayer = Layer.mergeAll(GeminiClient.live).pipe(
  Layer.provideMerge(MockConfigLayer),
  Layer.provideMerge(PlatformLayer),
);
const runGeminiQAWithEnvOrThrow = makeRunner(geminiTestLayer);

describe('GeminiClient (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateText: 正常系', async () => {
    generateContentMock.mockResolvedValue({
      text: 'hello world',
    });

    const program = Effect.gen(function* () {
      const client = yield* GeminiClient;

      return yield* client.generateText({
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'hi' }],
          },
        ],
      });
    });

    const result = await runGeminiQAWithEnvOrThrow(program);

    expect(result).toBe('hello world');
    expect(generateContentMock).toHaveBeenCalled();
  });

  it('generateText: textがない場合はエラー', async () => {
    generateContentMock.mockResolvedValue({});

    const program = Effect.gen(function* () {
      const client = yield* GeminiClient;

      return yield* client.generateText({
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'hi' }],
          },
        ],
      });
    });

    await expect(runGeminiQAWithEnvOrThrow(program)).rejects.toBeInstanceOf(
      AIError,
    );
  });

  it('streamChat: 正常系（文字分割される）', async () => {
    async function* mockStream() {
      yield { text: 'ab' };
      yield { text: 'c' };
    }

    generateContentStreamMock.mockResolvedValue(mockStream());

    const program = Effect.gen(function* () {
      const client = yield* GeminiClient;

      const stream = client.streamChat({
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'hi' }],
          },
        ],
      });

      return yield* Stream.runCollect(stream);
    });

    const result = await await runGeminiQAWithEnvOrThrow(program);

    expect(result).toEqual(['a', 'b', 'c']);
  });
});
