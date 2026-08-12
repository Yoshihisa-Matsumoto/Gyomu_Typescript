interface User {
  name: string
}

function callWithUser(user: User): void {
  console.log(user.name)
}

export function FunctionHandler() {
  callWithUser({ name: 'ABC' })
}
