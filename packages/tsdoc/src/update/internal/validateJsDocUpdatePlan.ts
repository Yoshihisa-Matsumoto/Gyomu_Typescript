import { toIdentityKey, toSymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import type {
  ContextEntry,
  JsDocUpdatePlan,
  TsDocFileContext,
} from '@gyomu/ai-compiler/jsdoc-update'

export const validateJsDocUpdatePlan = (
  context: TsDocFileContext,
  plans: JsDocUpdatePlan,
): { isValid: true } | { isValid: false; diff: Array<SymbolIdentity> } => {
  const contextKeys = getTsDocSignatureFromContext(context)
  const planKeys = getTsDocSingatureFromJsDocUpdateEntryPlan(plans)
  const diffKeys = reconcileKeys(contextKeys, planKeys)
  if (diffKeys.length > 0) {
    console.log(diffKeys.map((k) => toIdentityKey(k)))
    return {
      isValid: false,
      diff: diffKeys,
    }
  }
  return { isValid: true }
}

const reconcileKeys = (contextKeys: Set<string>, planKeys: Set<string>) => {
  const insufficientKeys: Array<string> = []
  for (const context of contextKeys) {
    if (!planKeys.has(context)) insufficientKeys.push(context)
  }
  for (const plan of planKeys) {
    if (!contextKeys.has(plan)) {
      console.log(`!!!! ${plan} only exists on Plan`)
    }
  }
  return insufficientKeys.map((key) => toSymbolIdentity(key))
}

const getTsDocSingatureFromJsDocUpdateEntryPlan = (plans: JsDocUpdatePlan) => {
  const keySet = new Set<string>()
  for (const plan of plans) {
    const key = toIdentityKey(plan.identity)
    keySet.add(key)
  }
  return keySet
}
export const getTsDocSignatureFromContext = (context: TsDocFileContext) => {
  const keySet = new Set<string>()
  for (const symbol of context.symbols) {
    const key = toIdentityKey(symbol.target)
    keySet.add(key)

    if (symbol.children) {
      checkContextEntries(symbol.children, keySet, 0)
    }
  }
  return keySet
}

const checkContextEntries = (entires: Array<ContextEntry>, keySet: Set<string>, depth: number) => {
  for (const member of entires) {
    if (member.kind == 'method' || member.kind == 'property') {
      if (member.documentable == false) continue
      const key = toIdentityKey(member.target)
      keySet.add(key)

      if (member.children && depth < 2) {
        checkContextEntries(member.children, keySet, depth + 1)
      }
    }
  }
}
