import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderJsDoc } from '../renderJsDoc.js'
import { renderJsDocLines } from '../internal/renderJsDocLines.js'
import { renderJsDocString } from '../internal/renderJsDocString.js'

vi.mock('../internal/renderJsDocLines.js', () => ({
  renderJsDocLines: vi.fn(),
}))

vi.mock('../internal/renderJsDocString.js', () => ({
  renderJsDocString: vi.fn(),
}))

describe('renderJsDoc', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders jsdoc using renderJsDocLines and renderJsDocString', () => {
    const updated = {
      target: {
        filePath: 'src/user.ts',
      },
      jsDoc: { startOffset: 10, endOffset: 15 },
      indent: '  ',
    } as any

    const lines = [
      {
        type: 'text',
        text: 'Create user',
      },
    ] as any

    vi.mocked(renderJsDocLines).mockReturnValue(lines)

    vi.mocked(renderJsDocString).mockReturnValue(
      `  /**
   * Create user
   */`,
    )

    const result = renderJsDoc(updated)

    expect(renderJsDocLines).toHaveBeenCalledTimes(1)
    expect(renderJsDocLines).toHaveBeenCalledWith(updated)

    expect(renderJsDocString).toHaveBeenCalledTimes(1)
    expect(renderJsDocString).toHaveBeenCalledWith(lines, false, '  ')

    expect(result).toEqual({
      startOffset: 8,
      endOffset: 13,
      target: updated.target,
      jsDoc: `  /**
   * Create user
   */`,
      indent: 2,
    })
  })

  it('returns undefined jsDoc when renderJsDocString returns undefined', () => {
    const updated = {
      target: {
        filePath: 'src/user.ts',
        signatureId: 'aa',
        symbolId: 'aa',
      },
      jsDoc: { startOffset: 10, endOffset: 15 },
      indent: '',
    } as any

    vi.mocked(renderJsDocLines).mockReturnValue([])

    vi.mocked(renderJsDocString).mockReturnValue(undefined)

    const result = renderJsDoc(updated)

    expect(result).toEqual({
      startOffset: 10,
      endOffset: 15,
      target: updated.target,
      jsDoc: undefined,
      indent: 0,
    })
  })
})
