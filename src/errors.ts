export class BaseError extends Error {
  innerError?: Error;

  constructor(message: string, innerError?: Error) {
    super();
    this.innerError = innerError;
  }
}
export class ValueError extends BaseError {}
export class ArchiveError extends BaseError {}
