export const normalizePath = (p: string) => p.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '')
