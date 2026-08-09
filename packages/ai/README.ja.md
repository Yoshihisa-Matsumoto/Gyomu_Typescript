# Gyomu AI

[US English](README.md) | JP 日本語

## 概要

`@gyomu/ai` パッケージは、Gyomu プロジェクトにおけるコアの AI 統合レイヤーとして機能し、インテリジェントなアプリケーションに向けて堅牢な実行基盤を提供します。その主な目的は、統一されたインターフェースを通じてさまざまな AI プロバイダーや SDK の差異を吸収することです。

モデル管理、リクエストルーティング、およびツール実行を抽象化することで、このパッケージは高い信頼性、拡張性、および保守性を担保します。Effect ベースの依存性注入を活用し、標準的なプロバイダーとシームレスに統合することで、耐障害性に優れたテキスト生成、構造化されたオブジェクトマッピング、および埋め込みを容易にします。

## アーキテクチャ

このパッケージは、AIモデルの管理、リクエストルーティング、ツール実行、エラー診断を明確に分離するモジュラーアーキテクチャで構成されています。基盤として、このパッケージは統合ハブおよびパブリックエントリーポイントとして機能し、AI層全体の操作を処理するために特化されたサブモジュールを調整します。

モデル管理とリクエストルーティングは、モデルレジストリと実行パスを統括する連携コンポーネントによって処理されます。モデルコンポーネントは、言語モデルおよび埋め込みモデルの中央集約的な定義と依存性注入レイヤーを維持します。これらのモデルはルーティングコンポーネントに直接マッピングされ、構造化されたルートノードを介してリクエスト階層をオーケストレーションし、自動フォールバック戦略を強制します。

ツール実行とエラー処理は、専用のコンポーネントを通じて管理されます。ツールサブシステムは、AI統合ツール向けの標準インターフェース、実行コンテキスト、承認ポリシーを確立します。同時に、エラーモジュールは構造化されたドメインエラーを提供し、ライフサイクルフェーズとリトライ状態をキャプチャすることで、すべてのサービス操作にわたって一貫した診断と障害復旧を保証します。

## インストール

pnpmを使用してインストールします。

```bash
pnpm add @gyomu/ai
```

## 依存関係

このパッケージはESM実行環境を必要とし、Effect 4.xをベースに構築されています。コアアーキテクチャにはEffectのランタイム、スキーマ、contextを利用しています。

内部インフラストラクチャやドメインパッケージとも密接に統合されており、具体的には、基盤となるI/O操作に `@gyomu/infra`、共有型に `@gyomu/schema`、AI駆動の承認ワークフローの処理に `@gyomu/approval-core` を使用しています。

## 開発

GyomuプロジェクトにおけるAI実行基盤として、本パッケージはAIプロバイダーやSDKの違いを吸収し、モデル管理、ルーティング、Tool実行、エラー処理を統一されたインターフェースで提供することで、信頼性・拡張性・保守性に優れたAIアプリケーションの基盤となることを目的としています。この目的を達成するため、コントリビューターはAIモデルへのアクセスを`AiService`および関連サービス経由に限定し、プロバイダー固有のSDKを直接利用せず抽象化されたProviderを使用しなければなりません。また、モデル構成は必ずRegistryに登録して一元管理し、利用側で直接管理することは厳に禁じられています。

拡張性と信頼性を担保するアーキテクチャとして、AIリクエストはRoutingを利用してフォールバックを考慮した構成とする必要があります。Toolの追加や実装にあたっては、入力スキーマと実行ポリシーを明示的に定義することが求められます。さらに、AIからの出力は決してそのまま信頼せず、必要に応じてスキーマ検証を行う設計を徹底してください。運用時の保守性を維持するため、エラーについても独自の実装を行わず、構造化して診断情報を保持できるように設計することがコントリビューターに求められます。

## Public API

- AI Model Registry - Centralized definitions, lookup services, and Effect layers for managing available language and embedding models.
- Model Request Routing - Configurable routing hierarchies that map request identifiers to execution nodes and support automated fallback behaviors.
- Tool Execution and Governance - Standardized abstractions for defining AI-integrated tools, tracking active execution tasks, and evaluating approval policies.
- AI Service Integration - Provider-agnostic parameter definitions and Vercel AI SDK integrations supporting text generation, streaming, object generation, and embeddings.
- Error Diagnostics - Structured domain errors and contextual metadata capturing lifecycle phases and retry states for operational failure handling.

## ライセンス

MIT