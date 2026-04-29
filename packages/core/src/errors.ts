import { AppErrorContext, Severity, withErrorTraits } from '@gyomu/shared';
import { Data } from 'effect';

interface DBErrorContext extends AppErrorContext {
  readonly operation?: 'select' | 'insert' | 'update' | 'delete' | 'custom';
  readonly table?: string;
  readonly query?: string;
  readonly params?: unknown;
}
export class DBError extends withErrorTraits(
  Data.TaggedError('ValueError')<DBErrorContext>,
) {}
interface DBErrorDetails {
  table: string;
  operation: DBErrorContext['operation'];
  message: string;
  context?: string;
  [key: string]: unknown;
}
export const dbError = (params: DBErrorDetails) => {
  const { table, message, operation, context, ...extra } = params;
  return (e: unknown): DBErrorContext => ({
    message: message,
    cause: e,
    context: context,
    details: {
      table: table,
      operation: operation,
      ...extra,
    },
  });
};

export type AIOperation = 'generate' | 'stream';

export type AIPhase =
  | 'request' // API呼び出し
  | 'response' // レスポンス受信
  | 'decode'; // 内容不正

export interface AIErrorContext extends AppErrorContext {
  readonly operation: AIOperation;
  readonly model: string;
  readonly phase: AIPhase;
  readonly retryable: boolean;
}
export class AIError extends withErrorTraits(
  Data.TaggedError('Ai Error')<AIErrorContext>,
  {
    isRetryable: (ctx) => {
      return ctx.retryable;
    },
  },
) {}

export const isRetryableAiError = (e: unknown): boolean => {
  if (!(e instanceof Error)) return false;

  const msg = e.message.toLowerCase();

  return (
    msg.includes('timeout') ||
    msg.includes('rate limit') ||
    msg.includes('temporarily') ||
    msg.includes('network')
  );
};

export interface TimeoutErrorContext extends AppErrorContext {
  readonly action: string;
  readonly timeoutSeconds: number;
  readonly intervalSeconds?: number;
  readonly elapsedMs?: number;
}
export class TimeoutError extends withErrorTraits(
  Data.TaggedError('TimeoutError')<TimeoutErrorContext>,
  { severity: Severity.ERROR, isRetryable: () => true },
) {}

export type IOLayer = 'stream' | 'filesystem' | 'csv' | 'archive';

export type IOOperation = 'read' | 'write' | 'open' | 'close' | 'transform';

export interface IOErrorContext extends AppErrorContext {
  readonly layer: IOLayer;
  readonly operation: IOOperation;
  readonly target?: string; // fileName / entryName / path
  readonly retryable?: boolean;
}
export class IOError extends withErrorTraits(
  Data.TaggedError('IOError')<IOErrorContext>,
  {
    isRetryable: (ctx) => {
      return ctx.retryable ?? false;
    },
  },
) {}

export interface AccessErrorContext extends AppErrorContext {
  readonly resource: string; // fileName
  readonly reason:
    | 'in_use'
    | 'locked'
    | 'permission_denied'
    | 'not_exist'
    | 'invalid';
}
export class AccessError extends withErrorTraits(
  Data.TaggedError('AccessError')<AccessErrorContext>,
) {}

export type ConfigPhase = 'load' | 'parse' | 'decode' | 'validate';

export interface ConfigErrorContext extends AppErrorContext {
  readonly key?: string; // 例: "DB_HOST"
  readonly source?: 'env' | 'file' | 'remote';
  readonly phase: ConfigPhase;
}
export class ConfigError extends withErrorTraits(
  Data.TaggedError('ConfigError')<ConfigErrorContext>,
) {}
// export class CriticalError extends AppError {
//   readonly _tag = 'CriticalError';
//   severity = Severity.FATAL;
//   isRetryable(): boolean {
//     return false;
//   }
//   constructor(message: string, cause?: unknown) {
//     super(message, cause);
//   }
// }
export interface GyomuErrorContext extends AppErrorContext {
  readonly operation: string; // fetchHoliday
  readonly domain: string; // market / file / ai
  readonly reason:
    | 'invalid_input'
    | 'not_found'
    | 'external_failure'
    | 'unexpected';
  readonly retryable?: boolean;
}

const isAccessError = (e: unknown) => e instanceof AccessError;
const isConfigError = (e: unknown) => e instanceof ConfigError;
const isNetworkError = (e: unknown) => e instanceof NetworkError;
const isIOError = (e: unknown) => e instanceof IOError;
const isAIError = (e: unknown) => e instanceof AIError;
const isDBError = (e: unknown) => e instanceof DBError;
export const mapGyomuReason = (e: unknown): GyomuErrorContext['reason'] => {
  if (isAccessError(e)) return 'invalid_input';
  if (isConfigError(e)) return 'external_failure';
  if (isNetworkError(e)) return 'external_failure';
  if (isIOError(e)) return 'external_failure';
  if (isAIError(e)) return 'external_failure';
  if (isDBError(e)) return 'external_failure';

  return 'unexpected';
};
export class GyomuError extends withErrorTraits(
  Data.TaggedError('GyomuError')<GyomuErrorContext>,
  {
    isRetryable: (ctx) => {
      return ctx.retryable ?? false;
    },
  },
) {}

export const gyomuExternalFailure =
  (operation: string, domain: string) => (e: unknown) =>
    new GyomuError({
      message: `${operation} failed`,
      operation,
      domain,
      reason: 'external_failure',
      cause: e,
    });

export type NetworkOperation = 'upload' | 'download' | 'connect' | 'request';

export interface NetworkErrorContext extends AppErrorContext {
  readonly operation: NetworkOperation;
  readonly endpoint?: string; // 例: ftp://host/path
  readonly retryable: boolean; // 通信系はここで判断できると強い
}
export const isRetryableNetworkError = (e: unknown): boolean => {
  if (!(e instanceof Error)) return false;

  const msg = e.message.toLowerCase();

  return (
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('temporarily') ||
    msg.includes('network')
  );
};
export class NetworkError extends withErrorTraits(
  Data.TaggedError('NetworkError')<NetworkErrorContext>,
  {
    isRetryable: (ctx) => {
      return ctx.retryable;
    },
  },
) {}

// export class ServerError extends AppError {
//   readonly _tag = 'ServerError';
//   severity = Severity.ERROR;
//   isRetryable(): boolean {
//     return false;
//   }
//   constructor(message: string, cause?: unknown) {
//     super(message, cause);
//   }
// }
