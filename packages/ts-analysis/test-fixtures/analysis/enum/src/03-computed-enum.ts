const BASE = 100

export enum HttpStatus {
  OK = 200,
  Created = OK + 1,
  Accepted = BASE,
  Random = Math.random(),
}

export enum BitFlag {
  A = 1 << 0,
  B = 1 << 1,
  C = A | B,
}
