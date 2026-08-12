export function getBinary(value: VType | undefined) {
  const result = value?.foo()
  return result
}

type VType = { foo: () => string }
