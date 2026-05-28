import { createHash } from 'node:crypto'

export const sha256 = (value: string | Uint8Array): string => {
  return createHash('sha256').update(value).digest('hex')
}

export const shortSha256 = (value: string | Uint8Array): string => {
  return sha256(value).slice(0, 12)
}
