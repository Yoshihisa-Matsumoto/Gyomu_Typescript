import { ValueError } from '../../error/ValueError.js'

/**
 * Adds a value to an array stored in the provided map, creating the array if the key does not exist.
 *
 * @param map The map containing arrays as values.
 *
 * @param key The key under which the value should be added.
 *
 * @param value The value to add to the array.
 *
 * @returns void
 */
export const addToMultiMap = <K, V>(map: Map<K, Array<V>>, key: K, value: V) => {
  const arr = map.get(key)
  if (arr) arr.push(value)
  else map.set(key, [value])
}

/**
 * Adds a value to a nested map structure, where the innermost map holds arrays of values.
 *
 * @param map The root nested map.
 *
 * @param keys A sequence of keys to traverse the nesting.
 *
 * @param value The value to insert into the target array.
 *
 * @returns void
 *
 * @throws ValueError if the keys array is empty.
 */
export const addToNestedMap = (map: Map<any, any>, keys: Array<any>, value: any) => {
  let current = map
  if (keys.length === 0) {
    throw new ValueError({
      message: 'keys must not be empty',
      field: 'keys',
      cause: undefined,
    })
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current.has(key)) {
      current.set(key, new Map())
    }
    current = current.get(key)
  }

  const lastKey = keys[keys.length - 1]
  const arr = current.get(lastKey)
  if (arr) {
    arr.push(value)
  } else {
    current.set(lastKey, [value])
  }
}
