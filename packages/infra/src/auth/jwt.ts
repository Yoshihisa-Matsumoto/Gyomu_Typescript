import { SignJWT, importPKCS8, importSPKI, jwtVerify } from 'jose'
import { IOError } from '@gyomu/schema'
import { Effect } from 'effect'
import { fromPromise } from '@gyomu/schema/effect'
import { readStringFromFile } from '../fs/fs-utils.js'
import type { JWTPayload } from 'jose'

export type JwtOption = {
  keyFilepath: string
  expiryHour: number
  algorithm?: string
}
export type JwtVerifyOption = {
  keyFilepath: string
}

export const signJwt = (payload: JWTPayload, option: Omit<Required<JwtOption>, 'expiryHour'>) => {
  return Effect.gen(function* () {
    const secretOrPrivateKey = yield* readStringFromFile(option.keyFilepath)
    return fromPromise(IOError, () => ({
      layer: 'filesystem' as const,
      message: 'fail to sign jwt',
      operation: 'write' as const,
    }))(async () => {
      const privateKey = await importPKCS8(secretOrPrivateKey, option.algorithm)

      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: option.algorithm })
        .sign(privateKey)
      return token
    })
  })
}

export const generateToken = (uid: string, option: JwtOption) =>
  Effect.gen(function* () {
    const secretOrPrivateKey = yield* readStringFromFile(option.keyFilepath)
    return fromPromise(IOError, () => ({
      layer: 'filesystem' as const,
      message: 'fail to sign jwt',
      operation: 'write' as const,
    }))(async () => {
      const privateKey = await importPKCS8(secretOrPrivateKey, option.algorithm ?? 'RS256')
      const payload = { name: uid }
      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: option.algorithm ?? 'RS256' })
        .setIssuedAt()
        .setExpirationTime(`${option.expiryHour}h`)
        .sign(privateKey)
      return token
    })
  })

export const validateToken = (
  token: string,

  option: JwtVerifyOption,
) =>
  readStringFromFile(option.keyFilepath).pipe(
    Effect.flatMap((key) =>
      Effect.tryPromise({
        try: async () => {
          const publicKey = await importSPKI(key, 'RS256')
          const { payload } = await jwtVerify(token, publicKey)

          return { result: true as const, uid: payload }
        },
        catch: () => ({ result: false as const, uid: '' }),
      }),
    ),
    Effect.catch(() => Effect.succeed({ result: false as const, uid: '' })),
  )
