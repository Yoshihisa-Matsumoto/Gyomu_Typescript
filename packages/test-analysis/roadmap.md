# Test Generation Roadmap

## Overview

Gyomuのテスト作成機能は、TypeScriptの静的解析だけでテストケースそのものを生成するのではなく、

1. TypeScriptの構造を静的に分析する
2. テスト設計に必要な情報を抽出する
3. LLMにテストケースを設計させる
4. 構造化されたTestPlan / TestDataを永続化する
5. TestPlanからVitestのテストコードを生成する

という段階的な構成を採用する。

基本方針は、

> **構造解析 → テスト分析 → 意味的なテスト設計 → テストコード生成**

の責務分離とする。

---

# Architecture

```text
                         TypeScript Source
                                │
                                ▼
                     ┌────────────────────┐
                     │   @gyomu/ts-analysis │
                     │                    │
                     │ Function Analysis  │
                     │ Function Body      │
                     │ Dependency         │
                     │ Branch             │
                     │ Error              │
                     │ Side Effect        │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │ @gyomu/test-analysis │
                     │                    │
                     │ Test Target        │
                     │ Dependencies       │
                     │ Mock Candidates    │
                     │ Test Signals       │
                     └─────────┬──────────┘
                               │
                               ▼
                         ┌────────────┐
                         │    LLM     │
                         │ Test Planner│
                         └─────┬──────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │ TestPlan / TestData │
                     │                    │
                     │ Test Cases         │
                     │ Inputs             │
                     │ Expected Results   │
                     │ Mock Behavior      │
                     └─────────┬──────────┘
                               │
                               ▼
                         ┌────────────┐
                         │    LLM /   │
                         │ Generator  │
                         └─────┬──────┘
                               │
                               ▼
                         Vitest Tests
```

---

# Package Strategy

`@gyomu/ts-analysis`

TypeScriptコードそのものの構造を分析する。

## Responsibility

Function Analysis
Function Body Analysis
Type Analysis
Call Analysis
Branch Analysis
Return Analysis
Error / Throw Analysis
Async / Await Analysis
Effect Analysis
Dependency Analysis
Side Effect Analysis

`ts-analysis`は「テスト」という概念を持たない。

> What does the code contain?

を明らかにすることが責務。

---

## `@gyomu/test-analysis`

ts-analysisの結果から、テスト設計に必要な情報を抽出する。

### Responsibility

- Test Target Analysis
- Dependency Analysis for Testing
- Mock Candidate Analysis
- Test Signal Analysis
- Side Effect Analysis for Testing
- Error Path Analysis
- Test Environment Information

`test-analysis`は「どのテストケースを書くべきか」を決定しない。

> What information is relevant for testing this code?

を明らかにすることが責務。

---

## Future: Test Planner

LLMを利用して、Test AnalysisからTestPlanを作成する。

```
TestTargetAnalysis
        +
Source
        +
Project Knowledge
        ↓
       LLM
        ↓
     TestPlan
```

### Responsibility

- 正常系のテストケース設計
- 異常系のテストケース設計
- 境界値のテストケース設計
- Dependency Failure
- Error Propagation
- Branch Coverage
- Business Rule
- Test Priority

ここではじめて「何をテストすべきか」という意味的判断を行う。

---

### Future: Test Generator

TestPlanをVitestコードへ変換する。

```
TestPlan
    +
TestTargetAnalysis
    +
Source
    ↓
Test Generator
    ↓
*.test.ts
```

### Responsibility

- describe
- it
- beforeEach
- vi.mock
- Mock initialization
- Test data initialization
- Assertion

Test Generatorはテストケースを考えない。

> TestPlanを忠実にテストコードへ変換する

ことを責務とする。

---

# Phase 0: ts-analysis Architecture Cleanup

## Goal

現在のFunction AnalysisがFunctionの種類ごとに分散している問題を整理し、共通のFunction Analysis Modelへ統合する。

これはほぼ完了。

## 確認できたこと

Function Member → analyzeFunctionBody
Class Constructor → analyzeFunctionBody
Variable Function → analyzeFunctionBody
Function Statement → analyzeFunctionBody
Function Type / Method Signature / Arrow Function → analyzeTypeFunction

## 結論

Function Body Analysisは既に共通化されている。

したがって、大規模なFunction Analysis再設計は不要。

---

# Phase 1: Function Body Analysis

## Goal

Function Bodyから、テスト分析に必要な構造情報を十分に取得できるようにする。

## Priority 0

### Call Analysis

- ▢ Function Call
- ▢ Method Call
- ▢ Constructor Call
- ▢ Imported Function Call
- ▢ Property-based Call

### Branch Analysis

- ▢ if
- ▢ Conditional Expression
- ▢ switch
- ▢ Logical AND / OR
- ▢ Nullish Coalescing
- ▢ Early Return

### Return Analysis

- ▢ Return Statement
- ▢ Return Value
- ▢ Multiple Return Paths
- ▢ Implicit Return
- ▢ Promise Return
- ▢ Effect Return

### Error Analysis

- ▢ throw
- ▢ Error Type
- ▢ Effect.fail
- ▢ Error Branch
- ▢ Error Propagation
- ▢ try/catch

### Async Analysis

- ▢ async
- ▢ await
- ▢ Promise Chain

### Effect Analysis

- ▢ Effect creation
- ▢ Effect failure
- ▢ Effect success
- ▢ Effect dependency
- ▢ Service access
- ▢ Layer-related dependency

### Dependency / Side Effect Analysis

- ▢ External module access
- ▢ Repository / DB access
- ▢ HTTP access
- ▢ File System access
- ▢ AI / external service access
- ▢ Clock / Random access
- ▢ Mutation candidate

---

## Priority 1

- ▢ Loop Analysis
- ▢ Callback Analysis
- ▢ Closure Analysis
- ▢ Variable Dependency
- ▢ try/catch/finally Analysis
- ▢ Nested Branch Analysis
- ▢ Conditional Dependency
- ▢ Exception Propagation

---

## Priority 2

- ▢ Data Flow Analysis
- ▢ Mutation Analysis
- ▢ Purity Analysis
- ▢ Advanced Dependency Analysis
- ▢ Interprocedural Analysis

Priority 2は最初から完全に実装しない。

Test Analysisで実際に必要になったものから追加する。

---

# Phase 2: @gyomu/test-analysis

## Goal

TypeScript Analysisをテスト設計に利用できる形へ変換する。

## Package Creation

- ▢ @gyomu/test-analysis Package作成
- ▢ Package.yaml作成
- ▢ Effect Schema導入
- ▢ Public API設計
- ▢ Unit Test基盤構築

---

## TestTargetAnalysis

対象Functionについて、テスト設計に必要な情報をまとめる。

```
TestTargetAnalysis
├── target
├── inputs
├── outputs
├── dependencies
├── mockCandidates
├── branches
├── errorPaths
├── sideEffects
└── testSignals
```

## Tasks

- ▢ Target Analysis
- ▢ Input Analysis
- ▢ Output Analysis
- ▢ Dependency Analysis
- ▢ Branch Analysis
- ▢ Error Path Analysis
- ▢ Side Effect Analysis
- ▢ Test Signal Analysis

## Mock Candidate Analysis

Mock対象を自動的に断定するのではなく、

> Mock Candidate

として候補を抽出する。

```
MockCandidate
├── dependency
├── reason
├── confidence
└── methods
```

### Candidate Examples

- Database
- Repository
- HTTP Client
- External API
- AI Service
- File System
- Clock
- Random
- External State

Pure FunctionなどはMock Candidateから除外する。

### Tasks

- ▢ External State Detection
- ▢ Side Effect Detection
- ▢ Service Detection
- ▢ Repository Detection
- ▢ IO Detection
- ▢ Mock Candidate Classification
- ▢ Confidence Calculation

---

## Test Environment Analysis

Vitestなどのテスト環境情報を扱う。

```
TestEnvironment
├── framework
├── mockApi
└── lifecycle
```

例えば、

```
framework: vitest
mockApi: vi
lifecycle:
  beforeEach: true
```

など。

ただし、プロジェクト設定とコード分析の責務は混ぜすぎない。

---

## Phase 2 Validation: Fixtures / Golden Tests

Static Test Analysisの品質をLLMなしで検証する。

```
fixtures/
├── pure-function/
├── repository/
├── effect/
├── async/
├── branching/
├── error/
├── side-effect/
└── complex/
```

各Fixtureについて、

```
Source Fixture
      ↓
Static Analysis
      ↓
Expected Analysis
```

を検証する。

### Tasks

- ▢ Pure Function Fixture
- ▢ Dependency Fixture
- ▢ Repository Fixture
- ▢ Async Fixture
- ▢ Effect Fixture
- ▢ Branching Fixture
- ▢ Error Fixture
- ▢ Side Effect Fixture
- ▢ Complex Function Fixture
- ▢ Golden Test導入

### Completion Criteria

Static Test Analysisの結果がLLMに依存せず再現可能であること。

---

# Phase 3: TestPlan Schema

## Goal

LLMが生成するテスト設計を構造化されたデータとして管理する。

## TestPlan

```
TestPlan
├── target
├── strategy
├── cases[]
└── coverage
```

## TestCase

```
TestCase
├── id
├── purpose
├── category
├── preconditions
├── input
├── mocks
└── expected
```

## Categories

- Success
- Error
- Boundary
- Dependency Failure
- Branch
- Edge Case

必要に応じて追加する。

---

## TestData

Test Caseとは分離して、再利用可能なTest Dataを管理する。

```
TestData
├── inputs
├── dependencies
├── mockResponses
└── expectedResults
```

目的は、LLMが毎回テストコードを最初から考え直すことを防ぐこと。

---

# Phase 4: LLM Test Planner

## Goal

Static Test Analysisを利用してTestPlanを生成する。

```
Source
+
FunctionAnalysis
+
TestTargetAnalysis
+
Project Knowledge
+
Coding Guidelines
        ↓
       LLM
        ↓
     TestPlan
```

## Tasks

- ▢ Test Planning Prompt設計
- ▢ TestPlan Schema
- ▢ Structured Output
- ▢ Normal Case Planning
- ▢ Error Case Planning
- ▢ Boundary Case Planning
- ▢ Dependency Failure Planning
- ▢ Branch Coverage Planning
- ▢ Test Priority
- ▢ Test Data Generation
- ▢ TestPlan Validation

---

# Phase 5: TestPlan Persistence

## Goal

LLMが毎回テストを最初から設計しない仕組みを作る。

TestPlan / TestDataは、単なるCacheではなく、テスト設計に関する永続的な知識として扱う。

候補:

```
.gyomu/
└── test/
    └── <target>/
        ├── TestPlan.yaml
        └── TestData.yaml
```

一方、自動再生成可能なStatic Analysis結果は、

```
.gyomu/
└── cache/
```

に置く。

## Design Principle

```
.gyomu/cache/
    → 再生成可能な分析結果

.gyomu/test/
    → 人間がレビュー・修正可能なテスト設計
```

# Phase 6: Incremental Test Planning

## Goal

Source変更時に、TestPlan全体を再生成しない。

```
TestPlan v1
    +
Source v1
```

からSourceが変更された場合、

```
Source v2
   ↓
Static Analysis
   ↓
Analysis Diff
   ↓
Affected Test Cases
   ↓
LLM Re-planning
   ↓
TestPlan v2
```

とする。

## Tasks

- ▢ Source Analysis Snapshot
- ▢ TestTargetAnalysis Snapshot
- ▢ Analysis Diff
- ▢ Affected Test Case Detection
- ▢ Partial TestPlan Regeneration
- ▢ TestPlan Versioning
- ▢ Human-edited TestPlan Preservation

---

# Phase 7: Test Generator

## Goal

TestPlanをVitestコードへ変換する。

```
TestPlan
+
TestData
+
TestTargetAnalysis
+
Source
        ↓
Test Generator
        ↓
Vitest Test
```

## Generated Elements

- ▢ describe
- ▢ it
- ▢ beforeEach
- ▢ vi.mock
- ▢ Mock initialization
- ▢ Test data initialization
- ▢ Mock behavior
- ▢ Assertions
- ▢ Effect execution
- ▢ Error assertions

---

## Test Generator Design Principle

Test GeneratorはTest Caseを決定しない。

```
Test Planner
    ↓
What should be tested?
```

```
Test Generator
    ↓
How should the TestPlan be expressed in Vitest?
```

という責務分離を維持する。

---

# Future Architecture

最終的には以下の構成を目指す。

```
@gyomu/ts-analysis
        │
        │ Structural Analysis
        ▼
@gyomu/test-analysis
        │
        │ Testing Signals
        ▼
Test Planner
        │
        │ Semantic Test Design
        ▼
TestPlan
        │
        ├── TestCase
        └── TestData
        │
        ▼
Test Generator
        │
        │ Vitest
        ▼
*.test.ts
```

---

## Core Design Principles

### 1. Static Analysisでテストケースを決めない

Static Analysisの責務は、

> このFunctionにはどのような構造・依存・分岐・エラー・副作用があるか

を明らかにすること。

「だから何をテストすべきか」という意味的判断はLLMに任せる。

---

### 2. LLMにコード全体を毎回作り直させない

TestPlanとTestDataを構造化・永続化し、既存のテスト設計を再利用する。

---

### 3. Mockは「候補」をStatic Analysisで抽出する

Static AnalysisがMock対象を断定するのではなく、

```
Mock Candidate
```

としてLLMおよびTest Plannerへ提供する。

---

### 4. TestPlanを中間成果物とする

TestPlanを導入することで、

```
Source
  ↓
Analysis
  ↓
TestPlan
  ↓
Test Code
```

を分離する。

これにより、Test Codeを再生成せずにTestPlanだけを更新できる。

---

### 5. TestPlanはCacheではなくKnowledgeとして扱う

Static Analysis結果は再生成可能なCache。

TestPlan / TestDataは、人間がレビュー・修正する可能性のあるテスト設計上のKnowledge。

---

### 6. 最初から高度なData Flow Analysisを作らない

まずは、

- Call
- Branch
- Return
- Error
- Async
- Effect
- Dependency
- Side Effect

を優先する。

高度なData Flow Analysisは、Test Analysisで必要になった時点で追加する。

---

## Milestones

### Milestone 1 — Function Analysis Foundation

- ▢ Function Analysis統合
- ▢ Function Body Analysis共通化
- ▢ Call / Branch / Return / Error Analysis
- ▢ Async / Effect Analysis

### Milestone 2 — Static Test Analysis

- ▢ @gyomu/test-analysis
- ▢ TestTargetAnalysis
- ▢ MockCandidate
- ▢ TestSignal
- ▢ Fixtures / Golden Tests

### Milestone 3 — Structured Test Planning

- ▢ TestPlan Schema
- ▢ TestCase Schema
- ▢ TestData Schema
- ▢ LLM Test Planner
- ▢ TestPlan Persistence

### Milestone 4 — Test Generation

- ▢ Vitest Generator
- ▢ Mock Generation
- ▢ beforeEach Generation
- ▢ Test Data Generation
- ▢ Assertion Generation

### Milestone 5 — Incremental Test Maintenance

- ▢ Analysis Diff
- ▢ Affected Test Detection
- ▢ Partial TestPlan Update
- ▢ Test Code Incremental Update

---

## Immediate Next Step

最初に実施するのはTest GeneratorでもLLMでもない。

`1`@gyomu/ts-analysis` の **Function Analysis** を整理する。

具体的には、

1. 現在存在するFunction Analysisをすべて棚卸しする
1. Function Typeごとの実装差異を整理する
1. 現在取得できているFunction Body情報を一覧化する
1. Test Analysisに必要だが不足している情報を洗い出す
1. 共通FunctionAnalysisモデルを設計する
1. Function Body Analysisを共通Traversalへ整理する
1. Fixtures / Unit Testsを整備する

ところから開始する。

この基盤が完成してから、`@gyomu/test-analysis`を新規パッケージとして実装する。
