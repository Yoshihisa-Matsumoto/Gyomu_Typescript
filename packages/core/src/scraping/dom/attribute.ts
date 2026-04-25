export class Attribute {
  readonly #attribute: Attr;
  constructor(attribute: Attr) {
    this.#attribute = attribute;
  }
  get name(): string {
    return this.#attribute.name;
  }
  get value(): string {
    return this.#attribute.value;
  }
}
