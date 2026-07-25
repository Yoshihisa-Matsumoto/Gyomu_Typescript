import { getCaller } from '@gyomu/schema'
import { Node, TypeReferenceNode } from 'ts-morph'
import type { ChildAnalysisArg } from '../analyzers/types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import type { AnalysisOptions } from '@gyomu/schema'

export function tracePlaceIdentity<T extends Node | undefined>(
  target: SymbolIdentity | TypeReferenceNode | ChildAnalysisArg<T>,
  options: AnalysisOptions | undefined,
  functionName?: string | undefined,
) {
  if (options?.debugInfo?.trace && functionName) console.log(functionName)
  if (!options || !options.debugInfo) return
  const keyword = options.debugInfo.keyword
  if (!keyword) return
  let targetIdentity: string | undefined
  if ('symbolId' in target) {
    if (!target.symbolId.includes(keyword) && !target.signatureId.includes(keyword)) {
      return
    }
    targetIdentity = target.symbolId
  } else if (!(target instanceof TypeReferenceNode)) {
    if (!target.node) return
    {
      const node = target.node

      if (Node.isNameable(node)) {
        const name = node.getName()
        targetIdentity = name
      }
      if (Node.isNamed(node)) {
        const name = node.getName()
        targetIdentity = name
        if (!targetIdentity) {
          const nameNode = node.getNameNode()
          targetIdentity = nameNode.getText()
        }
      }
      if (!targetIdentity && Node.isTypeNode(target.node)) {
        const name = node.getType()
        targetIdentity = name.getText()
      }
      if (!targetIdentity && Node.isExpression(node)) {
        // console.log(node.getKindName())
      }
    }
    const targetMemberPath = target.memberPath.find(
      (m) => typeof m == 'string' && m.includes(keyword),
    )
    if (targetMemberPath) {
      targetIdentity = target.memberPath.join(',')
    }
    if (!targetIdentity) return
    // console.log(targetIdentity)
    if (!targetIdentity.includes(keyword)) return
    // identity.ownerSymbolId
  } else {
    targetIdentity = target.getText()
  }

  const caller = getCaller()

  console.log(`[${caller}]  ${targetIdentity}`)
}
