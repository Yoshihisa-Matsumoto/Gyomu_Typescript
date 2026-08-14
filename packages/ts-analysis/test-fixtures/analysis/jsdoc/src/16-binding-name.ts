// Identifier
export function identifierBinding(value: string) {
  return value
}

// Object binding
export function objectBinding({ name, age }: { name: string; age: number }) {
  return name
}

// Object binding with rename
export function objectBindingRename({
  name: userName,
  age: userAge,
}: {
  name: string
  age: number
}) {
  return userName
}

// Object binding with default value
export function objectBindingDefault({
  name = 'unknown',
  age = 0,
}: {
  name?: string
  age?: number
}) {
  return name
}

// Object binding with rest
export function objectBindingRest({ name, ...rest }: { name: string; age: number }) {
  return rest
}

// Object binding nested
export function objectBindingNested({
  user: { name, age },
}: {
  user: {
    name: string
    age: number
  }
}) {
  return name
}

// Object binding nested with rename
export function objectBindingNestedRename({
  user: { name: userName },
}: {
  user: {
    name: string
  }
}) {
  return userName
}

// Array binding
export function arrayBinding([first, second]: [string, number]) {
  return first
}

// Array binding with omitted element
export function arrayBindingOmitted([first, , third]: [string, number, boolean]) {
  return third
}

// Array binding with default value
export function arrayBindingDefault([first = 'unknown', second = 0]: [string?, number?]) {
  return first
}

// Array binding with rest
export function arrayBindingRest([first, ...rest]: [string, ...number[]]) {
  return rest
}

// Array binding nested
export function arrayBindingNested([[first, second]]: [[string, number]]) {
  return first
}

// Mixed nested binding
export function mixedBinding({
  user: {
    name,
    roles: [firstRole, ...otherRoles],
  },
}: {
  user: {
    name: string
    roles: string[]
  }
}) {
  return name
}
