const methodObject = {
  execute(value: string): void {
    console.log(value)
  },
}

export function ComputedFunction(value: string) {
  // Computed property access
  const method = 'execute'
  methodObject[method](value)
  methodObject[method](value)
  methodObject['execute'](value)
  methodObject[getMethod()](value)
}

const getMethod = () => 'execute' as const
