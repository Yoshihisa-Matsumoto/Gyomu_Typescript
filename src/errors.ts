export class BaseError extends Error {
  innerError?: Error;

  constructor(message: string, innerError?: Error) {
    super(message);
    this.innerError = innerError;
  }
}
export class ValueError extends BaseError {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}
export class ArchiveError extends BaseError {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}

export class TimeoutError extends BaseError {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}

export class AccessError extends BaseError {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}

export class WebParseError extends BaseError {
  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}
