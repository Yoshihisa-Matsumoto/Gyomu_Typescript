/**
 * Rounds a number to the nearest integer at the specified decimal digit using half-adjust (round half up).
 *
 * @param targetNumber The number to round.
 *
 * @param digit The number of digits after the decimal point.
 *
 * @returns The rounded number.
 */
export const toHalfAdjust = (targetNumber: number, digit: number): number => {
  if (digit === 0) return Math.round(targetNumber)

  const adjust = Math.pow(10, digit)
  return Math.round(targetNumber * adjust) / adjust
}

/**
 * Rounds a number up to the nearest integer at the specified decimal digit.
 *
 * @param targetNumber The number to round.
 *
 * @param digit The number of digits after the decimal point.
 *
 * @returns The rounded-up number.
 */
export const toRoundUp = (targetNumber: number, digit: number): number => {
  if (digit === 0) return Math.ceil(targetNumber)

  const adjust = Math.pow(10, digit)
  return Math.ceil(targetNumber * adjust) / adjust
}

/**
 * Rounds a number down to the nearest integer at the specified decimal digit.
 *
 * @param targetNumber The number to round.
 *
 * @param digit The number of digits after the decimal point.
 *
 * @returns The rounded-down number.
 */
export const toRoundDown = (targetNumber: number, digit: number): number => {
  if (digit === 0) return Math.floor(targetNumber)

  const adjust = Math.pow(10, digit)
  return Math.floor(targetNumber * adjust) / adjust
}
