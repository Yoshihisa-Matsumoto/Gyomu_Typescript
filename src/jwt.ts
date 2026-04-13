import * as jwt from 'jsonwebtoken';
import { platform } from './platform/index.js';

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

export const generateToken = (uid: string, option: JwtOption) => {
  //  if (kind == 'AccessToken') {
  //console.log(option.expiryHour);
  const secretOrPrivateKey = platform.readFileSync(option.keyFilepath);
  const payload = { name: uid };
  const token = jwt.sign(payload, secretOrPrivateKey, {
    expiresIn: `${option.expiryHour}Hour`,
    algorithm: 'RS256',
  });
  return token;
  // } else {
  //   const expiresIn = `${getEnv().JWT_REFRESH_EXPIRY_DATE}d`;
  //   console.log(expiresIn);
  //   return jwt.sign({ name: uid }, getEnv().JWT_REFRESH_SECRET, {
  //     expiresIn: `${getEnv().JWT_REFRESH_EXPIRY_DATE}d`,
  //   });
  // }
};

export const validateToken = (
  token: string,

  option: JwtVerifyOption,
) => {
  try {
    const key = platform.readFileSync(option.keyFilepath);
    const accessResult = jwt.verify(token, key) as jwt.JwtPayload;
    return { result: true, uid: accessResult['name'] };
    // } else {
    //   const refreshResult = jwt.verify(
    //     token,
    //     getEnv().JWT_REFRESH_SECRET,
    //   ) as jwt.JwtPayload;
    //   return { result: true, uid: refreshResult['name'] };
    // }
  } catch (err) {
    return { result: false, uid: '' };
  }
};

// const accessToken = generateToken('1040235', {
//   expiryHour: 1,
//   keyFilepath: './jwt_private.pem',
// });
// console.log(validateToken(accessToken, { keyFilepath: './jwt_public.pem' }));
//const refreshToken = generateToken('1040235', 'RefreshToken');
//console.log(validateToken(refreshToken, 'RefreshToken'));
