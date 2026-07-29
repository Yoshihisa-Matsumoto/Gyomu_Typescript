import { SignJWT, importPKCS8, importSPKI, jwtVerify } from 'jose'
import { IOError } from '@gyomu/schema'
import { Effect } from 'effect'
import { fromPromise } from '@gyomu/schema/effect'
import { readStringFromFile } from '../fs/fs-utils.js'
import type { JWTPayload } from 'jose'

/**
 * Defines configuration options for signing JWTs, including the key file path, token expiration duration, and optional signing algorithm.
 */
export type JwtOption = {
  keyFilepath: string
  expiryHour: number
  algorithm?: string
}

/**
 * Defines configuration options for verifying JWTs, requiring a path to the public key file.
 */
export type JwtVerifyOption = {
  keyFilepath: string
}

/**
 * Signs a JWT payload using the specified key file and algorithm.
 *
 * @param payload The payload to include in the JWT.
 *
 * @param option The JWT signing options, excluding expiration.
 *
 * @returns Returns an Effect that resolves to the signed JWT string or fails with an IOError.
 */
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

/**
 * Generates a signed JWT for a given user ID based on the provided configuration.
 *
 * @param uid The unique user identifier.
 *
 * @param option The configuration options for generating the token.
 *
 * @returns Returns an Effect that resolves to the signed token string or fails with an IOError.
 */
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

/**
 * Validates a JWT string against a public key defined in the provided options.
 *
 * @param token The JWT string to validate.
 *
 * @param option The verification options containing the public key path.
 *
 * @returns Returns an Effect containing the validation result and user identity.
 */
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
