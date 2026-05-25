# @gyomu/config

Configuration Resolution and Policy Enforcement for Gyomu Applications

## Overview

`@gyomu/config` は Gyomu プラットフォーム全体で利用する汎用設定解決基盤を提供する。

本パッケージの責務は **設定の取得ではなく設定の解決（Configuration Resolution）とポリシー適用（Policy Enforcement）** である。

設定データは複数のソースから提供される。

例:

- Environment Variables
- .env
- JSON Files
- YAML Files
- Database
- Secret Manager
- Runtime Parameters
- User Inputs

`@gyomu/config` は複数の設定ソースを統合し、利用者が必要とする最終設定を解決する。

さらに、実行時に渡された設定が組織やシステムのポリシーに違反しないことを保証する。

---

# Goals

本パッケージは以下を提供する。

- 設定解決ルールの統一
- Config Source の統合
- Runtime設定の適用
- Policy Enforcement
- User別設定
- Scope別設定
- Function Group別設定
- Function別設定
- 型安全な設定取得
- Effect Config によるマッピング
- Effect Schema による検証
- Effect Layer によるDI
- 設定取得元に依存しない設計

---

# Non Goals

本パッケージは以下を提供しない。

- 環境変数の読み込み
- .envの読み込み
- JSONファイルの読み込み
- YAMLファイルの読み込み
- Databaseアクセス
- Secret Managerアクセス
- Config編集UI
- Config編集API

これらは別パッケージが担当する。

---

# Architecture

## Responsibility Separation

### Config Sources

設定データを提供する。

例

```text
Environment
File
Database
Secret Manager
Runtime Input
```

設定の取得方法は問わない。

---

### @gyomu/infra

設定取得を担当する。

例

```ts
yield * ConfigService.load(AppConfig)

yield *
  ConfigService.load(AppConfig, {
    file: './config.json',
  })
```

担当範囲

- Environment Variables
- .env
- JSON
- YAML（将来）
- Database（将来）
- Secret Manager（将来）

---

### @gyomu/config

設定解決を担当する。

担当範囲

- ConfigQuery解釈
- Config Source統合
- Runtime Payload適用
- Policy Evaluation
- 設定マージ
- User解決
- Scope解決
- Group解決
- Function解決
- Effect Schema検証

---

## Architecture Diagram

```text
Application
      │
      ▼
ConfigResolver
      │
      ├─ Static Config
      │
      ├─ Runtime Payload
      │
      ▼
Policy Evaluation
      │
      ▼
Typed Config
```

---

# Core Concepts

## User

ユーザー固有設定。

例

```text
user01
user02
admin
```

---

## Scope

実行コンテキストを表す。

例

```text
approval
document-write
faq-search
contract-review
mail-generation
```

Scopeにより用途別設定を切り替える。

---

## Group

機能グループ。

複数Functionで共通設定を共有する。

例

```text
file
approval
llm
mail
calendar
```

---

## Function

個別機能。

例

```text
writeFile
editFile
deleteFile

sendMail
draftMail
```

---

## Group と Function の関係

```text
Group
 ├─ Function
 ├─ Function
 └─ Function
```

例

```text
file
 ├─ writeFile
 ├─ editFile
 └─ deleteFile
```

---

# Resolution Model

## ConfigQuery

設定取得条件。

```ts
export interface ConfigQuery {
  readonly userId?: string

  readonly scope?: string

  readonly group?: string

  readonly functionName?: string
}
```

例

```ts
{
  userId: 'user01',
  scope: 'approval',
  group: 'file',
  functionName: 'writeFile',
}
```

---

## Config Mapping

静的設定の読み込みには Effect Config を利用する。

これにより設定ソースとアプリケーション内部の設定構造を分離できる。

例

```ts
Config.all({
  model: Config.string('MODEL'),
  temperature: Config.number('TEMPERATURE'),
})
```

環境変数

```text
MODEL=gpt-5
TEMPERATURE=0.7
```

結果

```ts
{
  model: 'gpt-5',
  temperature: 0.7,
}
```

---

## Runtime Payload

実行時に渡された設定。

例

```ts
{
  temperature: 0
}
```

```ts
{
  maxTokens: 1000
}
```

```ts
{
  rootFolder: 'c:\\private'
}
```

Runtime Payload は一時的な設定変更を表現する。

例:

- ユーザー入力
- APIパラメータ
- Workflowパラメータ
- AI生成パラメータ

---

# Resolution Modes

設定をどのソースから解決するかを指定する。

```ts
export type ConfigResolutionMode = 'static' | 'runtime' | 'mixed'
```

---

## static

静的設定のみ利用する。

対象例:

- Environment Variables
- JSON Files
- Database
- Secret Manager

---

## runtime

Runtime Payload のみ利用する。

対象例:

- User Inputs
- Workflow Parameters
- API Request Parameters

このモードでは `rawConfig` は不要。

---

## mixed

静的設定と Runtime Payload を統合する。

Runtime Payload の適用方法は Resolution Strategy により決定する。

---

# Config Request

設定取得要求を表す。

```ts
type ConfigRequest<ConfigSchema extends EffectSchema> =
  | RuntimeConfigRequest<ConfigSchema>
  | StaticConfigRequest<ConfigSchema>
  | MixedConfigRequest<ConfigSchema>
```

---

## RuntimeConfigRequest

```ts
{
  resolutionMode: 'runtime'
  rawConfig?: never
}
```

---

## StaticConfigRequest

```ts
{
  resolutionMode: 'static'
  rawConfig: Config.Config<unknown>
}
```

---

## MixedConfigRequest

```ts
{
  resolutionMode?: 'mixed'
  rawConfig: Config.Config<unknown>
}
```

---

# Resolution Strategies

設定競合時の解決ルールを定義する。

```ts
export type ConfigResolutionStrategy = 'override' | 'restrictive' | 'permissive'
```

---

## override

後から適用された設定を優先する。

```text
base
 ↓
payload
```

---

## restrictive

より厳しい設定を採用する。

例

```json
base:
{
  "maxTokens": 1000
}

payload:
{
  "maxTokens": 2000
}
```

結果

```json
{
  "maxTokens": 1000
}
```

---

## permissive

より緩い設定を採用する。

例

```json
base:
{
  "maxTokens": 1000
}

payload:
{
  "maxTokens": 2000
}
```

結果

```json
{
  "maxTokens": 2000
}
```

---

# Policy Enforcement

Runtime Payload はそのまま適用されるとは限らない。

設定解決後にポリシー評価を行う。

---

## Violation Modes

ポリシー違反時の挙動を定義する。

```ts
export type ConfigViolationMode = 'ignore' | 'adjust' | 'reject'
```

---

### ignore

違反を無視する。

---

### adjust

許可された値へ補正する。

例

```text
c:\private

↓

c:\data\project
```

---

### reject

設定解決を失敗させる。

---

## Example

システム設定

```json
{
  "rootFolder": "c:\\data\\project"
}
```

ユーザー指定

```json
{
  "rootFolder": "c:\\private"
}
```

結果

```text
ConfigPolicyViolationError
```

---

# Configuration Resolution Order

静的設定が存在する場合は以下の順序で解決される。

```text
Global
 ↓
User
 ↓
Scope
 ↓
UserScope
```

後から適用された設定が優先される。

---

# Group / Function Resolution

同一レベル内では以下の順序で適用する。

```text
Group
 ↓
Function
```

---

# Configuration Structure

推奨構造

```json
{
  "groups": {
    "file": {
      "baseFolder": "/tmp",

      "functions": {
        "writeFile": {
          "encoding": "utf8"
        },

        "editFile": {
          "backup": true
        }
      }
    }
  }
}
```

---

# ConfigResolver

本パッケージの中心コンポーネント。

責務

1. ConfigQuery解析
2. 静的設定読み込み
3. Runtime Payload取得
4. Source統合
5. Runtime Payload適用
6. Policy Evaluation
7. User解決
8. Scope解決
9. Group解決
10. Function解決
11. Schema検証
12. 型付き結果返却

---

## Resolution Flow

```text
ConfigRequest
      │
      ▼
Load Static Config
      │
      ▼
Resolve Mode
      │
      ▼
Merge Sources
      │
      ▼
Apply Strategy
      │
      ▼
Policy Evaluation
      │
      ▼
Resolve User/Scope
      │
      ▼
Resolve Group/Function
      │
      ▼
Schema Validation
      │
      ▼
Typed Config
```

---

# Usage

```ts
const config =
  yield *
  ConfigResolver.get({
    schema: FileConfigSchema,

    rawConfig: FileToolConfig,

    query: {
      userId,
      scope: 'approval',
      group: 'file',
      functionName: 'writeFile',
    },

    payload: {
      rootFolder: 'c:\\private',
    },

    resolutionMode: 'mixed',

    strategy: 'restrictive',

    violationMode: 'reject',
  })
```

---

# Effect Integration

すべて Effect Layer として提供する。

```ts
const AppLayer = Layer.mergeAll(ConfigLayer, ConfigResolverLive)
```

---

# Errors

## ConfigValidationError

Schema検証失敗。

---

## ConfigPolicyViolationError

ポリシー違反。

---

## ConfigResolutionError

設定解決失敗。

---

# Future Extensions

将来的に以下を追加可能。

- YAML Support
- Database Config
- Remote Config
- Secret Manager
- Config Cache
- Config Editing API
- Config Administration UI

これらは ConfigResolver の設計を変更せずに追加できる。
