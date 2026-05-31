[**@gyomu/config**](../README.md)

***

[@gyomu/config](../README.md) / ConfigService

# Interface: ConfigService

Defined in: packages/config/src/ConfigResolver.ts:33

Service for resolving application configuration.

The resolver combines configuration from multiple scopes and returns a
validated, strongly typed result.

Resolution order:

```text
Global
 ↓
User
 ↓
Scope
 ↓
UserScope
```

Within each level:

```text
Group
 ↓
Function
```

## Properties

### get

> `readonly` **get**: \<`ConfigSchema`\>(`schema`, `query`) => `Effect`\<`Type`\<`ConfigSchema`\>, `ConfigError`\>

Defined in: packages/config/src/ConfigResolver.ts:46

Resolves configuration matching the specified query.

The resulting configuration is validated using the provided schema
before being returned.

#### Type Parameters

##### ConfigSchema

`ConfigSchema` *extends* `Decoder`\<`unknown`, `never`\>

Target configuration schema.

#### Parameters

##### schema

`ConfigSchema`

Schema used to validate and decode the resolved configuration.

##### query

[`ConfigQuery`](ConfigQuery.md)

Configuration resolution criteria.

#### Returns

`Effect`\<`Type`\<`ConfigSchema`\>, `ConfigError`\>

A typed configuration value.
