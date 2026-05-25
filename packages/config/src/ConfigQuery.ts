/**
 * Configuration resolution criteria.
 *
 * Specifies which configuration scope should be resolved.
 *
 * Configuration is resolved by combining values from:
 *
 * 1. Global configuration
 * 2. User configuration
 * 3. Scope configuration
 * 4. User + Scope configuration
 *
 * Additional filtering can be applied using {@link scope} and
 * {@link function}.
 */
export interface ConfigQuery {
  /**
   * User identifier.
   *
   * When specified, user-specific configuration is included in the
   * resolution process.
   *
   * Example:
   *
   * ```ts
   * { userId: 'user01' }
   * ```
   */
  readonly userId?: string

  /**
   * Function scope name.
   *
   * Scopes are used to share configuration across related functions.
   *
   * Examples:
   *
   * - file
   * - mail
   * - approval
   * - llm
   */
  readonly scope?: string

  /**
   * Function name within a group.
   *
   * Function-specific configuration overrides group-level configuration.
   *
   * Examples:
   *
   * - writeFile
   * - editFile
   * - sendMail
   */
  readonly function?: string
}
