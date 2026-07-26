import type { ComplexityStrategy } from './ComplexityStrategy.js'
import type { ModeContext } from './ModeContext.js'

/**
 * Determines the appropriate JSDoc update mode ('light' or 'deep') based on symbol context and complexity strategy.
 *
 * @param context The current mode resolution context.
 *
 * @param strategy The complexity evaluation strategy.
 *
 * @returns The resolved update mode.
 */
export const modeResolver = (
  context: ModeContext,
  strategy: ComplexityStrategy,
): 'light' | 'deep' => {
  if (context.symbol.publicApi) return 'deep'

  if (context.symbol.humanEdited) return 'deep'

  if (context.file.defaultMode === 'deep') return 'deep'

  if (strategy.isComplex(context)) return 'deep'

  return 'light'
}
