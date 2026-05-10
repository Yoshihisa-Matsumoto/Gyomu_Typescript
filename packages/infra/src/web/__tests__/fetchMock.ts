// tests/setup/fetchMock.ts
import { vi } from 'vitest'

export const mockFetch = (
  body: any,
  options?: {
    ok?: boolean
    status?: number
  },
) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(body)))
        controller.close()
      },
    }),
  })
}
