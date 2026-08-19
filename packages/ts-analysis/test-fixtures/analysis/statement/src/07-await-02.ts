export async function awaitValue() {
  await foo()
}

const foo = async () => `Hello`
