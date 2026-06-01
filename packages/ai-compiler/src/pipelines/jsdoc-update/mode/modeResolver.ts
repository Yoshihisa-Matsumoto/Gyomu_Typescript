import type { ComplexityStrategy } from './ComplexityStrategy.js'
import type { ModeContext } from './ModeContext.js'

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
