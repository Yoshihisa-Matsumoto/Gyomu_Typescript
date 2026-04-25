import { ValueError } from '../../errors.js';

export const addToMultiMap = <K, V>(map: Map<K, V[]>, key: K, value: V) => {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
};

export const addToNestedMap = (map: Map<any, any>, keys: any[], value: any) => {
  let current = map;
  if (keys.length === 0) {
    throw new ValueError('keys must not be empty');
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current.has(key)) {
      current.set(key, new Map());
    }
    current = current.get(key);
  }

  const lastKey = keys[keys.length - 1];
  const arr = current.get(lastKey);
  if (arr) {
    arr.push(value);
  } else {
    current.set(lastKey, [value]);
  }
};
