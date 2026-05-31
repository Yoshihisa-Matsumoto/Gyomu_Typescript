# TSDocエージェント開発ロードマップ

## ゴール

TypeScriptプロジェクト向けの、
安全かつ段階的に進化可能なTSDocメンテナンスエージェントを構築する。

エージェントは以下を実現する:

- 変更ファイルの検出
- ts-morph を用いたソース構造解析
- ドキュメント重要度の評価
- TSDoc の生成・更新
- 人間が記述したコメントの保護

---

# 基本方針

## 1. 人間の知識を保護する

エージェントは、
手動で記述されたコメントを破壊的に置換してはならない。

特に以下のような情報は保護対象とする:

- アーキテクチャ説明
- ドメインルール
- remarks
- examples
- 運用知識
- 設計意図

---

## 2. 段階的進化を優先する

最初から全機能を実装しない。

以下の流れを、
段階的に進化させていく:

```text
hash → analysis → parsing → safe update → generation
```

---

## 3. ドキュメント価値は均一ではない

複雑なAPIやドメイン上重要なAPIほど、
詳細な説明が必要になる。

一方で、
単純な内部ユーティリティには
過剰なコメントは不要。

エージェントは:

```text
コメント量最大化
```

ではなく、

```text
ドキュメント価値最適化
```

を目指す。

---

# 推奨開発フェーズ

---

# Phase 1 — 変更検知

## ゴール

変更されたソースファイルを検出する。

## 実装範囲

実装対象:

- ファイル列挙
- ハッシュ生成
- キャッシュ保存

## 初期型

```ts
FileHashEntry
```

## 備考

最初は raw hash のみでよい。

```ts
sha256(sourceText)
```

semantic hash は後から追加する。

---

# Phase 2 — 最小AST解析

## ゴール

exportされたsymbolを抽出する。

## 実装範囲

ts-morph を用いて以下を解析:

- function
- interface
- class
- type
- const export

## 初期型

```ts
FileAnalysis
SymbolAnalysis
SymbolKind
ExportAnalysis
```

## 備考

この段階では:

- complexity
- scoring
- dependency graph

などはまだ実装しない。

まずは:

```text
解析モデルが成立するか
```

を確認する。

---

# Phase 3 — 既存JSDoc解析

## ゴール

既存コメントを安全に理解できるようにする。

## 実装範囲

以下を解析:

- summary
- remarks
- examples
- param tags
- returns tags
- throws tags

さらに:

- protected region
- generated marker
- human-edited section

を検出する。

## 初期型

```ts
JsDocAnalysis
```

## 重要

まだコメント生成はしない。

まずは:

```text
変更前に理解する
```

ことを優先する。

---

# Phase 4 — Safe Update戦略

## ゴール

手動コメントを破壊せずに更新できるようにする。

## 実装範囲

以下を実装:

- 部分更新
- tag単位merge
- protected region
- AI管理領域

## 重要ルール

禁止:

```text
JSDoc全置換
```

推奨:

```text
summary置換
@param merge
@returns merge
```

保護対象:

```text
@remarks
@example
設計説明
アーキテクチャ説明
```

---

# Phase 5 — 最小TSDoc生成

## ゴール

基本summaryを生成する。

## 例

```ts
/**
 * Creates approval request.
 */
```

## 実装範囲

生成対象:

- summary のみ

まだ生成しないもの:

- @param
- @returns
- @throws
- examples

---

# Phase 6 — Signature解析

## ゴール

関数シグネチャを深く理解できるようにする。

## 実装範囲

解析対象:

- parameter
- return type
- generic
- nested object complexity

## 型

```ts
SignatureAnalysis
ParameterAnalysis
ParameterStructure
ObjectMetrics
```

## この段階で可能になること

以下を生成可能にする:

- @param
- @returns

---

# Phase 7 — Effect解析

## ゴール

Effectベースのコードに対する
ドキュメント品質を向上させる。

## 実装範囲

以下を検出:

```ts
Effect<A, E, R>
```

抽出対象:

- success type
- error type
- requirements type

## 型

```ts
EffectSignals
```

## この段階で可能になること

以下を改善:

- @throws生成
- Effect-awareな説明生成

---

# Phase 8 — Complexity解析

## ゴール

説明コストを推定できるようにする。

## 実装範囲

解析対象:

- nesting
- branching
- generic depth
- union complexity
- async boundary

## 型

```ts
ComplexityMetrics
FileMetrics
```

---

# Phase 9 — Documentation Scoring

## ゴール

どのsymbolに詳細説明が必要かを判定する。

## 実装範囲

以下を計算:

- API surface importance
- domain criticality
- maintenance risk
- complexity score

## 型

```ts
ScoreHints
DomainSignals
```

## この段階で可能になること

エージェントが:

```text
どこに詳細コメントを書くべきか
```

を判断できるようになる。

---

# Phase 10 — Dependency Graph解析

## ゴール

アーキテクチャ上の依存関係を理解する。

## 実装範囲

解析対象:

- import
- re-export
- dependency edge

## 型

```ts
DependencyEdge
ImportAnalysis
```

## 備考

このフェーズは後回しでよい。

依存グラフは有用だが、
初期TSDoc生成には必須ではない。

---

# 最重要アーキテクチャ方針

このシステムは:

```text
自動化最大化
```

ではなく、

```text
安全なドキュメント保守
```

を優先する。

人間が記述した
設計知識・アーキテクチャ知識を失うことは、

生成コメント不足より遥かに危険。

---

# 推奨追加ドキュメント

将来的に以下のドキュメントを追加することを推奨:

| ファイル             | 内容               |
| -------------------- | ------------------ |
| architecture.md      | 全体アーキテクチャ |
| analysis-model.md    | 解析モデル定義     |
| scoring.md           | スコアリング戦略   |
| update-strategy.md   | safe merge戦略     |
| semantic-hash.md     | semantic hash戦略  |
| protected-regions.md | 保護領域設計       |
