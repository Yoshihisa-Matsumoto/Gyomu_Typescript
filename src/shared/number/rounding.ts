export const toHalfAdjust = (targetNumber: number, digit: number): number => {
  if (digit === 0) return Math.round(targetNumber);

  const adjust = Math.pow(10, digit);
  return Math.round(targetNumber * adjust) / adjust;
};

export const toRoundUp = (targetNumber: number, digit: number): number => {
  if (digit === 0) return Math.ceil(targetNumber);

  const adjust = Math.pow(10, digit);
  return Math.ceil(targetNumber * adjust) / adjust;
};

export const toRoundDown = (targetNumber: number, digit: number): number => {
  if (digit === 0) return Math.floor(targetNumber);

  const adjust = Math.pow(10, digit);
  return Math.floor(targetNumber * adjust) / adjust;
};
