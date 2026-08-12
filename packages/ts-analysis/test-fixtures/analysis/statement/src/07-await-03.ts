export async function awaitValue() {
  return await foo()
}

const foo = async () => `Hello`
