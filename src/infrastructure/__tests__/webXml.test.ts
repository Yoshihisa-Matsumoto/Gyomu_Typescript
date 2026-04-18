import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Effect } from 'effect';

import { postAndReceiveXml } from '../web/api.js';
import { NetworkError, ValueError } from '../../errors.js';
import * as client from '../web/client.js';
import * as stream from '../../shared/effect/stream.js';
import * as xml from '../web/xml.js';
// ===== mock =====
vi.mock('../web/client.js', () => ({
  fetchEffect: vi.fn(),
  fetchStream: vi.fn(),
}));

vi.mock('../../shared/effect/stream.js', () => ({
  networkStream: vi.fn(),
}));

vi.mock('../web/xml.js', () => ({
  textEffect: vi.fn(),
  parseXmlEffect: vi.fn(),
}));

vi.mock('../web/json.js', () => ({
  jsonEffect: vi.fn(),
}));

// ===== import mocked =====

describe('postAndReceiveXml', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('正常系: XMLがパースされて返る', async () => {
    const mockResponse: Response = {
      status: 200,
      body: {} as any,
    } as any as Response;

    vi.mocked(client.fetchEffect).mockReturnValue(Effect.succeed(mockResponse));

    vi.mocked(stream.networkStream).mockReturnValue('stream' as any);
    vi.mocked(xml.textEffect).mockReturnValue(Effect.succeed('<xml></xml>'));
    vi.mocked(xml.parseXmlEffect).mockReturnValue(
      Effect.succeed({ result: 'ok' }),
    );

    const result = await Effect.runPromise(
      postAndReceiveXml('url', { a: '1' }),
    );

    expect(result).toEqual({
      value: { result: 'ok' },
      code: 200,
      extraAttribute: undefined,
    });
  });

  it('bodyがない場合はNetworkError', async () => {
    vi.mocked(client.fetchEffect).mockReturnValue(
      Effect.succeed({
        status: 200,
        body: null,
      } as any as Response),
    );

    await expect(
      Effect.runPromise(postAndReceiveXml('url', {})),
    ).rejects.toBeInstanceOf(NetworkError);
  });

  it('validateでNGの場合はValueError', async () => {
    vi.mocked(client.fetchEffect).mockReturnValue(
      Effect.succeed({
        status: 200,
        body: {} as any,
      } as any as Response),
    );

    vi.mocked(stream.networkStream).mockReturnValue('stream' as any);
    vi.mocked(xml.textEffect).mockReturnValue(Effect.succeed('<xml></xml>'));
    vi.mocked(xml.parseXmlEffect).mockReturnValue(
      Effect.succeed({ result: 'ng' }),
    );

    await expect(
      Effect.runPromise(
        postAndReceiveXml(
          'url',
          {},
          {
            isValidData: () => false,
          },
        ),
      ),
    ).rejects.toBeInstanceOf(ValueError);
  });

  it('extraAttributeが返る', async () => {
    vi.mocked(client.fetchEffect).mockReturnValue(
      Effect.succeed({
        status: 200,
        body: {} as any,
      } as any as Response),
    );

    vi.mocked(stream.networkStream).mockReturnValue('stream' as any);
    vi.mocked(xml.textEffect).mockReturnValue(Effect.succeed('<xml></xml>'));
    vi.mocked(xml.parseXmlEffect).mockReturnValue(
      Effect.succeed({ result: 'ok' }),
    );

    const result = await Effect.runPromise(
      postAndReceiveXml(
        'url',
        {},
        {
          extraAttribute: { meta: 1 },
        },
      ),
    );

    expect(result.extraAttribute).toEqual({ meta: 1 });
  });
});
