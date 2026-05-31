[**@gyomu/config**](../README.md)

***

[@gyomu/config](../README.md) / ConfigQuery

# Interface: ConfigQuery

Defined in: packages/config/src/ConfigQuery.ts:16

Configuration resolution criteria.

Specifies which configuration scope should be resolved.

Configuration is resolved by combining values from:

1. Global configuration
2. User configuration
3. Scope configuration
4. User + Scope configuration

Additional filtering can be applied using [group](#group) and
[functionName](#functionname).

## Properties

### functionName?

> `readonly` `optional` **functionName?**: `string`

Defined in: packages/config/src/ConfigQuery.ts:70

Function name within a group.

Function-specific configuration overrides group-level configuration.

Examples:

- writeFile
- editFile
- sendMail

***

### group?

> `readonly` `optional` **group?**: `string`

Defined in: packages/config/src/ConfigQuery.ts:57

Function group name.

Groups are used to share configuration across related functions.

Examples:

- file
- mail
- approval
- llm

***

### scope?

> `readonly` `optional` **scope?**: `string`

Defined in: packages/config/src/ConfigQuery.ts:43

Execution scope or use-case identifier.

Scopes allow configuration to vary by context.

Examples:

- approval
- document-write
- faq-search
- contract-review

***

### userId?

> `readonly` `optional` **userId?**: `string`

Defined in: packages/config/src/ConfigQuery.ts:29

User identifier.

When specified, user-specific configuration is included in the
resolution process.

Example:

```ts
{ userId: 'user01' }
```
