# Test Maintenance Agent 構想

## 概要

現在のコーディングエージェントは、ソースコードから知識を抽出し、段階的により高いレベルの概念を構築している。

```
AST
  ↓
TSDoc
  ↓
FileSummary
  ↓
DirectoryConcept
  ↓
PackageConcept
```

この知識基盤を利用し、将来的にはテストコードについても同様の解析・保守を行う **Test Maintenance Agent** を実現したい。

目的は「テストコードを生成すること」ではなく、

- 変更影響分析
- テストコードの保守
- fixture・mockの保守
- 不足テストケースの提案・生成

までを一貫して行える仕組みを構築することである。

---

# 全体構成

PackageConceptまで構築した後、テスト専用の知識を生成する。

```
AST
   │
TSDoc
   │
FileSummary
   │
DirectoryConcept
   │
PackageConcept
   │
──────────────
TestAnalysis
   │
TestConcept
   │
──────────────
Test Maintenance Agent
```

TestAnalysisは既存のソース解析結果を利用し、テストコードを構造化するレイヤーである。

TestConceptはLLMを利用してテストの意図や責務を抽象化した知識となる。

---

# TestAnalysis

TestAnalysisではテストコードを構造化する。

対象は以下を想定している。

- testファイル
- fixture
- helper
- factory
- builder
- mock

例えば

```
tests/
fixture/
test-fixtures/
builders/
factories/
```

などを解析対象とする。

解析結果には例えば以下を保持する。

## TestFile

- 対象となるソース
- import一覧
- 利用している公開API
- describe構造
- testケース一覧
- 利用fixture
- 利用mock

## Fixture

fixtureはJSONだけではなく

- Builder
- Factory
- Helper
- Seeder

なども含め、「テストデータ提供コンポーネント」として扱う。

保持したい情報例

- 提供するデータ
- 利用されるテスト
- 依存するfixture

## Mock

保持したい情報例

- Mock対象
- Mock方式
- 利用テスト
- 共通Mockかどうか

---

# TestConcept

TestAnalysisは構造情報である。

その上でLLMにより、テストの目的を抽象化する。

例えば

```
createUser.test.ts
```

について

```
Summary

このテストは createUser の振る舞いを保証する。

対象

- 正常作成
- 重複エラー
- 権限不足

Fixture

- adminUser
- duplicateUser

Mock

- UserRepository
```

のような情報を保持する。

これにより

- このテストは何を保証しているか
- 何が不足しているか

を判断しやすくなる。

---

# Test Maintenance Agent

TestConceptを利用し、以下の機能を提供する。

## 変更影響分析

変更されたソースコードから

- 修正すべきテスト
- 修正すべきfixture
- 修正すべきmock

を推定する。

例

```
createUser.ts
```

を変更した場合

```
createUser.test.ts

fixture/createUser

UserRepositoryMock
```

などへの影響を検出する。

---

## テストケース分析

現在存在するテストケースを分析する。

例えば

```
describe(createUser)

✓ 正常
✓ 名前なし
✓ 重複
```

を

```
Target

createUser

Cases

- Normal
- ValidationError
- DuplicateError
```

のような構造へ変換する。

これにより

- ケース不足
- 重複ケース
- 古くなったケース

を検出しやすくなる。

---

## テスト生成

変更内容から

- 新規テストケース
- 既存ケース更新

を生成する。

単なる生成ではなく

既存テストとの整合性を保ちながら更新することを目的とする。

---

## Fixture生成・保守

テストケース追加時に必要な

- fixture
- Builder
- Factory

を生成・更新する。

fixtureの重複や不要データの削除も対象とする。

---

## Mock保守

新しい依存追加やインターフェース変更に合わせ

- vi.mock
- vi.fn
- spyOn

などを更新する。

---

## Coverage補助

ソースコード解析結果と比較し

例えば

- ValidationError
- RepositoryError
- PermissionError

などが未テストであることを検出する。

これはコードカバレッジではなく

**仕様カバレッジ**

を補助することを目的とする。

---

# 現時点で利用できる情報

既に構築済みの情報だけでも多くの解析が可能である。

## TSDoc

責務の理解

## FileSummary

ファイルの役割理解

## DirectoryConcept

レイヤ・ディレクトリ責務の理解

## PackageConcept

設計方針・アーキテクチャ理解

これらをTestAnalysisへ入力することで、LLMによる解析精度向上が期待できる。

---

# 今後の課題

現時点では難しいと考えられる点も存在する。

## テスト意図の理解

```
it("test1")
```

のような名称では保証内容が分からない。

LLMによる解析が必要となる。

---

## fixtureの意味解析

例えば

```
user1.json
```

だけでは

- 管理者
- 一般ユーザー
- 無効ユーザー

などが分からない。

利用箇所や内容から意味を推定する必要がある。

---

## Mock責務の理解

Mock対象が

- Repository
- API
- 外部サービス
- Logger

など何を表しているかを解析する必要がある。

---

## 仕様レベルでの網羅性

単なるコードカバレッジではなく

「このUseCaseなら権限チェックが必要」

「このRepositoryならトランザクション失敗を考慮すべき」

といった仕様レベルの知識が必要となる。

これはPackageConceptやDirectoryConceptを利用することで補える可能性がある。

---

# 実装優先順位

規模を考慮すると、READMEやConcept生成など既存機能の完成後に着手するのが望ましい。

想定する実装順序は以下の通り。

1. TestAnalysis
2. TestConcept
3. Test Impact Analysis
4. Test Generator
5. Fixture Maintenance
6. Mock Maintenance
7. Coverage Support
8. Conflict Resolver

まずはテスト資産を正しく解析・構造化することを優先し、その後に生成・保守機能を追加していく。
