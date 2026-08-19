export function binaryOperators(a: any, b: any, obj: object) {
  const eq = a == b
  const neq = a != b
  const strictEq = a === b
  const strictNeq = a !== b

  const lt = a < b
  const lte = a <= b
  const gt = a > b
  const gte = a >= b

  const inOperator = a in obj
  const instanceofOperator = a instanceof b

  const add = a + b
  const subtract = a - b
  const multiply = a * b
  const divide = a / b
  const modulo = a % b
  const power = a ** b

  const leftShift = a << b
  const rightShift = a >> b
  const unsignedRightShift = a >>> b

  const bitAnd = a & b
  const bitXor = a ^ b
  const bitOr = a | b

  const logicalAnd = a && b
  const logicalOr = a || b
  const nullish = a ?? b

  return {
    eq,
    neq,
    strictEq,
    strictNeq,
    lt,
    lte,
    gt,
    gte,
    inOperator,
    instanceofOperator,
    add,
    subtract,
    multiply,
    divide,
    modulo,
    power,
    leftShift,
    rightShift,
    unsignedRightShift,
    bitAnd,
    bitXor,
    bitOr,
    logicalAnd,
    logicalOr,
    nullish,
  }
}
