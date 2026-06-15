import { withOptional } from '@gyomu/schema'
import type { EffectSignals, TypeAnalysis } from '@gyomu/schema/typescript'

export const detectEffectSignals = (typeRawText: string): EffectSignals | undefined => {
  const genericText = extractEffectGenericText(typeRawText)

  if (!genericText) {
    return undefined
  }

  const args = splitTopLevelGenerics(genericText)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const successType: string = args[0]!
  const errorType = args.length >= 2 ? args[1] : undefined
  const requirementsType = args.length > 2 ? args[2] : undefined

  return {
    returnsEffect: true,

    success: {
      text: successType,
      ...withOptional({ effect: successType ? detectEffectSignals(successType) : undefined }),
    },

    error: errorType
      ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ({
          text: errorType,
          ...withOptional({ effect: detectEffectSignals(errorType) }),
        } as TypeAnalysis)
      : undefined,

    requirements: requirementsType
      ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ({
          text: requirementsType,
          ...withOptional({ effect: detectEffectSignals(requirementsType) }),
        } as TypeAnalysis)
      : undefined,

    hasErrorType: args.length >= 2,

    hasRequirementsType: args.length >= 3,

    effectDepth: estimateEffectDepth(typeRawText),
  }
}

const splitTopLevelGenerics = (text: string): Array<string> => {
  const result: Array<string> = []

  let depth = 0
  let start = 0

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (ch === '<') {
      depth++
    } else if (ch === '>') {
      depth--
    } else if (ch === ',' && depth === 0) {
      result.push(text.slice(start, i).trim())
      start = i + 1
    }
  }

  result.push(text.slice(start).trim())

  return result
}

const extractEffectGenericText = (text: string): string | undefined => {
  const prefixes = ['Effect.Effect<', 'Effect<']

  const prefix = prefixes.find((p) => text.startsWith(p))

  if (!prefix) {
    return undefined
  }

  return text.slice(prefix.length, -1)
}

const estimateEffectDepth = (text: string): number => {
  let depth = 0

  let current = text

  while (current.startsWith('Effect<') || current.startsWith('Effect.Effect<')) {
    depth++

    const generic = extractEffectGenericText(current)

    if (!generic) {
      break
    }

    const args = splitTopLevelGenerics(generic)

    current = args[0] ?? ''
  }

  return depth
}
