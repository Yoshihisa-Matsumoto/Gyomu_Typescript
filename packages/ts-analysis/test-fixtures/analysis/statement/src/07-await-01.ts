export async function awaitValue() {
  const result = await foo()
  return result
}

const foo = async () => `Hello`
