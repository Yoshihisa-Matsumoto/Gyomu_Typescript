# @gyomu/approval-core

Approval Workflow and Human-in-the-Loop Decision Framework for Gyomu Applications

## Overview

`@gyomu/approval-core` は Gyomu プラットフォーム全体で利用する汎用承認基盤を提供する。

本パッケージの責務は **承認要求の管理（Approval Request Management）と承認状態遷移（Approval State Management）** である。

承認は AI Tool に限定されない。

例:

- AI Tool 実行
- Workflow 実行
- 本番デプロイ
- ファイル削除
- システム設定変更
- ユーザー権限変更
- 業務申請

`@gyomu/approval-core` は承認要求の作成、状態管理、監査履歴管理を提供する。

承認方式や通知方式には依存しない。

---

# Goals

本パッケージは以下を提供する。

- 承認要求管理
- 承認状態管理
- 承認・却下処理
- 監査ログ管理
- Human-in-the-Loop Workflow
- 長時間承認待機
- プロセス再起動耐性
- 非同期承認
- UI非依存設計
- 通知方式非依存設計
- AI非依存設計
- Workflow非依存設計
- Effect Layer によるDI

---

# Non Goals

本パッケージは以下を提供しない。

- 承認画面
- 承認メール送信
- Slack通知
- Teams通知
- SMS通知
- Push通知
- Workflow Engine
- AI Agent
- AI Tool 実行
- 権限制御

これらは別パッケージが担当する。

---

# Architecture

## Responsibility Separation

### Approval Request

承認対象を表現する。

例

```text
本番デプロイ承認

ファイル削除承認

AI Tool実行承認
```

---

### Approval Store

承認要求の保存と状態管理を担当する。

担当範囲

- 承認要求保存
- 状態更新
- 状態取得
- 履歴管理

---

### Notification Layer

承認者へ通知する。

例

```text
UI

Email

Slack

Teams

Webhook
```

本パッケージの責務外。

---

### Execution Layer

承認完了後の処理を実行する。

例

```text
AI Tool

Workflow

Deploy

Batch
```

本パッケージの責務外。

---

## Architecture Diagram

```text
Execution Request
        │
        ▼
Approval Request
        │
        ▼
Approval Store
        │
        ▼
Pending
        │
        ├─ Approved
        │
        └─ Rejected
```

---

# Core Concepts

## Approval Request

承認対象を表現する。

例

```text
Deploy Production

Delete Files

Execute AI Tool
```

---

## Approval Challenge

承認時に必要な追加入力を表現する。

例

```text
Confirm

Select

Input
```

---

## Approval Resolution

承認者による決定結果。

例

```text
Approved

Rejected
```

---

## Approval Record

監査履歴を表現する。

例

```text
Requested

Approved

Rejected
```

---

## Pending Execution

承認後に実行予定の処理。

承認要求とは独立して管理する。

---

# Approval Lifecycle

承認要求は以下の状態を持つ。

```text
Pending
 ├─ Approved
 └─ Rejected
```

---

## Pending

承認待ち。

---

## Approved

承認済み。

---

## Rejected

却下済み。

---

# Approval Request

承認要求を表現する。

```ts
export interface ApprovalRequest {
  readonly id: ApprovalRequestId

  readonly status: ApprovalStatus

  readonly requestedBy: UserId

  readonly title: string

  readonly description?: string

  readonly challenge?: ApprovalChallenge

  readonly createdAt: Date
}
```

---

# Approval Status

承認状態。

```ts
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
```

---

# Approval Challenge

承認時に必要な追加操作を表現する。

## Confirm

単純承認。

```ts
{
  type: 'confirm'
}
```

---

## Select

選択式承認。

```ts
{
  type: 'select'

  options: ['staging', 'production']
}
```

---

## Input

文字列入力を要求する。

```ts
{
  type: 'input'

  label: 'Reason'
}
```

---

# Approval Resolution

承認結果を表現する。

```ts
export interface ApprovalResolution {
  readonly requestId: ApprovalRequestId

  readonly actor: UserId

  readonly type: 'approved' | 'rejected'

  readonly response?: JsonValue

  readonly reason?: string

  readonly timestamp: Date
}
```

---

# Approval History

監査履歴。

```ts
export interface ApprovalRecord {
  readonly requestId: ApprovalRequestId

  readonly actor: UserId

  readonly action: 'requested' | 'approved' | 'rejected'

  readonly channel?: 'ui' | 'email' | 'slack' | 'api'

  readonly reason?: string

  readonly response?: JsonValue

  readonly occurredAt: Date
}
```

---

# Approval Requester

承認要求作成を担当する。

```ts
export interface ApprovalRequester {
  createRequest: (request: ApprovalRequest) => Effect<ApprovalRequestId>
}
```

---

# Approval Store

承認状態管理を担当する。

```ts
export interface ApprovalStore {
  getRequest: (id: ApprovalRequestId) => Effect<ApprovalRequest>

  resolve: (resolution: ApprovalResolution) => Effect<void>

  getResolution: (requestId: ApprovalRequestId) => Effect<ApprovalResolution | undefined>
}
```

---

# Pending Execution Integration

承認後に実行する処理は本パッケージの責務ではない。

ただし、承認要求との関連付けを想定する。

例

```ts
interface PendingExecution {
  readonly executionId: string

  readonly requestId: ApprovalRequestId
}
```

---

# Long Running Approval

承認は即時完了するとは限らない。

例

```text
数分後

数時間後

数日後
```

承認要求は永続化可能でなければならない。

---

# Human-in-the-Loop

本パッケージは Human-in-the-Loop Workflow をサポートする。

例

```text
Execution Request
      │
      ▼
Approval Request
      │
      ▼
Pending
      │
      ▼
Human Decision
      │
      ▼
Approved
      │
      ▼
Resume Execution
```

---

# Effect Integration

すべて Effect Layer として提供する。

```ts
const AppLayer = Layer.mergeAll(ApprovalStoreLive, ApprovalRequesterLive)
```

---

# Errors

## ApprovalRequestNotFoundError

承認要求が存在しない。

---

## ApprovalAlreadyResolvedError

既に承認または却下済み。

---

## InvalidApprovalResponseError

承認時入力が Challenge 要件を満たさない。

---

## ApprovalStoreError

保存処理失敗。

---

# Future Extensions

将来的に以下を追加可能。

- Multi Step Approval
- Multiple Approver
- Approval Expiration
- Approval Delegation
- Approval Policy Engine
- Approval Notification Framework
- Approval Administration UI
- Approval REST API
- Approval Analytics

これらは Approval Core の設計を変更せずに追加できる。
