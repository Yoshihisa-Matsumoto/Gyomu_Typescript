import type { HumanEditSignal, ProtectedSection } from '@gyomu/schema/typescript'

export const computeProtectedSections = (
  signals: Array<HumanEditSignal>,
): Array<ProtectedSection> => {
  const regions: Array<ProtectedSection> = []
  regions.push(...HumanEditSignals2ProtectedRegion(signals))

  return regions
}
const HumanEditSignals2ProtectedRegion = (
  signals: Array<HumanEditSignal>,
): Array<ProtectedSection> => {
  const regions: Array<ProtectedSection> = []

  const group = groupHumanEditSignals(signals).filter((g) => g.score >= 1)
  // if (group.length > 0) console.log(group)

  for (const signal of group) {
    const normalizeScore = Math.ceil(signal.score * 10) / 10
    regions.push({
      targetSection: signal.targetSection,
      score: normalizeScore,
    })
  }
  return regions
}
interface HumanEditSignalGroup {
  targetSection: string
  score: number
  signals: Array<HumanEditSignal>
}
const groupHumanEditSignals = (
  signals: ReadonlyArray<HumanEditSignal>,
): Array<HumanEditSignalGroup> => {
  const map = new Map<string, HumanEditSignalGroup>()

  for (const signal of signals) {
    const targetSection = signal.details.targetSection

    const key = targetSection ?? ''

    const existing = map.get(key)

    if (existing) {
      existing.score += signal.score
      existing.signals.push(signal)
    } else {
      map.set(key, {
        targetSection: key,
        score: signal.score,
        signals: [signal],
      })
    }
  }

  return [...map.values()]
}
