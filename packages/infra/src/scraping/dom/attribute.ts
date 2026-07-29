/**
 * Represents a DOM attribute node.
 */
export class Attribute {
  /**
   * The internal DOM Attr node.
   */
  readonly #attribute: Attr

  /**
   * Creates a new Attribute instance wrapping the specified DOM attribute.
   *
   * @param attribute The DOM attribute to wrap.
   *
   * @returns The initialized Attribute instance.
   */
  constructor(attribute: Attr) {
    this.#attribute = attribute
  }

  /**
   * Gets the name of the attribute.
   *
   * @returns The attribute name.
   */
  get name(): string {
    return this.#attribute.name
  }

  /**
   * Gets the value of the attribute.
   *
   * @returns The attribute value.
   */
  get value(): string {
    return this.#attribute.value
  }
}
