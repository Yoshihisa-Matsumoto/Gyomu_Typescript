import { Logger } from 'effect';
import { logger } from '../logger.js';

export const effectLogger = Logger.make(({ logLevel, message }) => {
  switch (logLevel) {
    case 'Debug':
      logger.debug(message);
      break;
    case 'Info':
      logger.info(message);
      break;
    case 'Warn':
      logger.warn(message);
      break;
    case 'Error':
      logger.warn(message);
      break;
  }
});

// export const initEffectLogger = () => {
//   Effect.provide(Logger.layer([effectLogger], { mergeWithExisting: false }));
// };
