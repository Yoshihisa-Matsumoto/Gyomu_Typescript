import { join } from 'node:path'
import type { ConfigQuery } from '../../ConfigQuery.js'
import type { ConfigLayer } from '../../types/ConfigLayer.js'

export const buildConfigPaths = (
  rootDirectory: string,
  query: ConfigQuery,
): ReadonlyMap<ConfigLayer, string> => {
  const entries: Array<readonly [ConfigLayer, string]> = [
    ['global', join(rootDirectory, 'setting.json')],
  ]

  if (query.userId) {
    entries.push(['user', join(rootDirectory, 'users', query.userId, 'setting.json')])
  }

  if (query.scope) {
    entries.push(['scope', join(rootDirectory, 'scopes', `${query.scope}.json`)])
  }

  if (query.userId && query.scope) {
    entries.push(['user-scope', join(rootDirectory, 'users', query.userId, `${query.scope}.json`)])
  }

  return new Map(entries)
}
