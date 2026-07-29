import type { UiErrorContext, UiErrorHandlerMap } from './types.js'

/**
 * Creates a UI error handler function that selects and executes a specific handler from the provided map based on the error's display category.
 *
 * @param handlers A mapping of error display types to their corresponding handler functions.
 *
 * @param ctx The error context containing the error details to be processed.
 *
 * @returns The result of executing the selected handler.
 */
export const handleUiError = (handlers: UiErrorHandlerMap) => (ctx: UiErrorContext) => {
  const handler = handlers[ctx.error.display]

  if (!handler) {
    throw new Error(`No handler for ${ctx.error.display}`)
  }

  return handler(ctx)
}
