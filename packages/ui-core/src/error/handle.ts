import type { UiErrorContext, UiErrorHandlerMap } from './types.js'

export const handleUiError = (handlers: UiErrorHandlerMap) => (ctx: UiErrorContext) => {
  const handler = handlers[ctx.error.display]

  if (!handler) {
    throw new Error(`No handler for ${ctx.error.display}`)
  }

  return handler(ctx)
}
