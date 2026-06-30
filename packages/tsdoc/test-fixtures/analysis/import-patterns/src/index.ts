import ps from 'node:path'

import DefaultValue from './default-value.js'

import { VERSION, createUser as buildUser } from './types.js'

import * as Types from './types.js'
import type { User, UserId } from './types.js'

export const value = VERSION

export const factory = buildUser

export type { User, UserId }

export { DefaultValue, Types }

export { ps }
