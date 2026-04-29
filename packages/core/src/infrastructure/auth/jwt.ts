import * as jwt from 'jsonwebtoken';
import { readFromFile } from '../fs/fs-utils.js';
import { fromPromise, fromSync } from '@gyomu/shared/effect';
import { IOError } from '../../errors.js';
import { Effect } from 'effect';
import { Uint8ArraytoBuffer } from '../../shared/binary/convert.js';
//import { fs } from '../fs/index.js';

// let env_priv: Record<string, never> | undefined = undefined;
// const getEnv = () => {
//   if (env_priv) return env_priv;
//   const env2 = parsedEnv(
//     z.object({
//       JWT_ACCESS_SECRET: z.string(),
//       JWT_ACCESS_EXPIRY: z.string().regex(/^[0-9]+[md]$/, {
//         message: `Expiry need to be specified as number + 'm' or 'd'`,
//       }),
//       JWT_REFRESH_SECRET: z.string(),
//       JWT_REFRESH_EXPIRY_DATE: z.coerce.number(),
//     }),
//   );
//   env_priv = env2;
//   return env_priv;
// };

export type JwtOption = {
  keyFilepath: string;
  expiryHour: number;
};
export type JwtVerifyOption = {
  keyFilepath: string;
};

export const generateToken = (uid: string, option: JwtOption) =>
  Effect.gen(function* () {
    const secretOrPrivateKey = yield* readFromFile(option.keyFilepath);
    const payload = { name: uid };
    const token = yield* fromSync(IOError, () => ({
      message: `Fail to generate JWT`,
      layer: 'filesystem' as const,
      operation: 'transform' as const,
      details: { uid, option },
    }))(() =>
      jwt.sign(payload, Uint8ArraytoBuffer(secretOrPrivateKey), {
        expiresIn: `${option.expiryHour}Hour`,
        algorithm: 'RS256',
      }),
    );
    return token;
  });

export const validateToken = (
  token: string,

  option: JwtVerifyOption,
) =>
  readFromFile(option.keyFilepath).pipe(
    Effect.flatMap((key) =>
      Effect.try({
        try: () => {
          const payload = jwt.verify(
            token,
            Uint8ArraytoBuffer(key),
          ) as jwt.JwtPayload;

          return { result: true as const, uid: payload['name'] as string };
        },
        catch: () => ({ result: false as const, uid: '' }),
      }),
    ),
    Effect.catch(() => Effect.succeed({ result: false as const, uid: '' })),
  );
//   try {
//     const key = fs.readFileSync(option.keyFilepath);
//     const accessResult = jwt.verify(token, key) as jwt.JwtPayload;
//     return { result: true, uid: accessResult['name'] };
//     // } else {
//     //   const refreshResult = jwt.verify(
//     //     token,
//     //     getEnv().JWT_REFRESH_SECRET,
//     //   ) as jwt.JwtPayload;
//     //   return { result: true, uid: refreshResult['name'] };
//     // }
//   } catch (err) {
//     return { result: false, uid: '' };
//   }
// };

// const accessToken = generateToken('1040235', {
//   expiryHour: 1,
//   keyFilepath: './jwt_private.pem',
// });
// console.log(validateToken(accessToken, { keyFilepath: './jwt_public.pem' }));
//const refreshToken = generateToken('1040235', 'RefreshToken');
//console.log(validateToken(refreshToken, 'RefreshToken'));
