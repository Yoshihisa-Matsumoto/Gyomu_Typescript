import { basename } from 'node:path'

type PathMatcherBase =
  | {
      kind: 'fileName'
      fileName: string
    }
  | {
      kind: 'relativePath'
      relativePath: string
    }
  | {
      kind: 'directory'
      directory: string
    }
  | {
      kind: 'all'
    }

type PathMatcher = PathMatcherBase & {
  match: (path: string) => boolean
}

const normalizePath = (path: string): string =>
  path.replaceAll('\\', '/').replaceAll(/\/+/g, '/').replace(/^\.\//, '')

export const createPathMatcher = (filter?: string | undefined): PathMatcher => {
  if (!filter) {
    return {
      kind: 'all',
      match: (path: string) => true,
    }
  }
  const normalized = normalizePath(filter)

  if (normalized.endsWith('/**')) {
    return {
      kind: 'directory',
      directory: normalized.slice(0, -3),
      match: (path: string) => {
        const normalizedPath = normalizePath(path)
        const directory = normalized.slice(0, -3)
        return normalizedPath === directory || normalizedPath.startsWith(`${directory}/`)
      },
    }
  }

  if (normalized.includes('/')) {
    return {
      kind: 'relativePath',
      relativePath: normalized,
      match: (path: string) => {
        const normalizedPath = normalizePath(path)
        return normalizedPath.endsWith(normalized)
      },
    }
  }

  return {
    kind: 'fileName',
    fileName: normalized,
    match: (path: string) => {
      const normalizedPath = normalizePath(path)
      return basename(normalizedPath) === normalized
    },
  }
}
