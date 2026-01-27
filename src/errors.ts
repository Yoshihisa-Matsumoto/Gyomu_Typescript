export class BaseError extends Error {
  innerError?: unknown;

  constructor(message: string, innerError?: unknown) {
    super(message);
    this.innerError = innerError;
  }
}
export class ValueError extends BaseError {
  constructor(message: string, innerError?: unknown) {
    super(message, innerError);
  }
}
export class ArchiveError extends BaseError {
  constructor(message: string, innerError?: unknown) {
    super(message, innerError);
  }
}

export class TimeoutError extends BaseError {
  constructor(message: string, innerError?: unknown) {
    super(message, innerError);
  }
}

export class AccessError extends BaseError {
  constructor(message: string, innerError?: unknown) {
    super(message, innerError);
  }
}

export class WebParseError extends BaseError {
  constructor(message: string, innerError?: unknown) {
    super(message, innerError);
  }
}

export class ParseError extends BaseError {
  constructor(message: string, innerError?: unknown) {
    super(message, innerError);
  }
}

export class DBError extends BaseError {
  constructor(message: string, innerError?: unknown) {
    super(message, innerError);
  }
}

export class CriticalError extends BaseError {
  constructor(message: string, innerError?: unknown) {
    super(message, innerError);
  }
}

export class NetworkError extends BaseError {
  constructor(message: string, innerError?: unknown) {
    super(message, innerError);
  }
}
