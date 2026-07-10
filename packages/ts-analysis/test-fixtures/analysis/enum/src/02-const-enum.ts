export const enum TokenKind {
  Identifier,
  Number,
  String,
}

export const enum Flags {
  None = 0,
  Read = 1,
  Write = 2,
  Execute = 4,
}
