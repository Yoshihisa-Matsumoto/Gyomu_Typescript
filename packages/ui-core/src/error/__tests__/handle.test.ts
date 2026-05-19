import { describe, expect, it, vi } from 'vitest'
import { handleUiError } from '../handle.js'

describe('handleUiError', () => {
  it('calls matching handler and returns its result', () => {
    const toastHandler = vi.fn(() => 'toast-result')

    const handlers = {
      toast: toastHandler,
    }

    const ctx = {
      error: {
        display: 'toast',
      },
    }

    const result = handleUiError(handlers)(ctx as never)

    expect(toastHandler).toHaveBeenCalledTimes(1)
    expect(toastHandler).toHaveBeenCalledWith(ctx)
    expect(result).toBe('toast-result')
  })

  it('passes full context to handler', () => {
    const handler = vi.fn()

    const handlers = {
      modal: handler,
    }

    const ctx = {
      error: {
        display: 'modal',
        message: 'failed',
      },
      retry: vi.fn(),
    }

    handleUiError(handlers as never)(ctx as never)

    expect(handler).toHaveBeenCalledWith(ctx)
  })

  it('throws when matching handler does not exist', () => {
    const handlers = {
      toast: vi.fn(),
    }

    const ctx = {
      error: {
        display: 'dialog',
      },
    }

    expect(() => handleUiError(handlers as never)(ctx as never)).toThrow('No handler for dialog')
  })

  it('does not call unrelated handlers', () => {
    const toastHandler = vi.fn()
    const modalHandler = vi.fn()

    const handlers = {
      toast: toastHandler,
      modal: modalHandler,
    }

    const ctx = {
      error: {
        display: 'modal',
      },
    }

    handleUiError(handlers)(ctx as never)

    expect(modalHandler).toHaveBeenCalledTimes(1)
    expect(toastHandler).not.toHaveBeenCalled()
  })
})
