const internalValue = 1
const VERSION = 2.3

export { internalValue as value }

export default class UserService {}

export type { User } from './intrnal.js'

export { foo, foo2, UserRole } from './intrnal.js'

export { foo as fooAlias } from './intrnal.js'
export { type User as UserAlias } from './intrnal.js'

export * from './intrnal.js'
export * as Internal from './intrnal.js'

export { VERSION }
export { VERSION as VERSION2 }

export { type User as Alias } from './intrnal.js'

export * from './def.js'
export { default as DefaultService } from './def2.js'
