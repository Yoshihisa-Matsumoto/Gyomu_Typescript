# Gyomu AI Compiler

[US English](README.md) | JP 日本語

## 概要

本パッケージは、Gyomuプロジェクト向けにAI駆動のコンパイルおよびコードインテリジェンス基盤を提供します。主な目的は、ソースコード分析、ドキュメント生成、コード要約などのAI処理タスクを宣言的パイプラインとして構築・実行することです。\n\nこれらの自動化ワークフローを標準化することで、一貫性があり、再現性と保守性に優れたAI支援型ソフトウェア開発を実現します。JSDocの更新やファイルの要約から、パッケージのConcept生成、ドキュメントセクションの構築、コンテンツの翻訳に至るまで、複雑なタスクを効率的に管理します。

## アーキテクチャ

このパッケージは、コンテキストモデリング、スキーマ定義、ストラテジー解決、タスク実行という明確な機能領域に責任を分割する、特化した処理パイプラインを中心に構成されています。連携するコンポーネントが協調して、JSDocの更新、ファイルやディレクトリの要約、Conceptの生成、ドキュメントの構築、コンテンツの翻訳といったコンパイルおよびコードインテリジェンスのタスクを駆動します。

コンテキスト管理コンポーネントは、ソースコード要素やドキュメントの状態を表現するために必要な基礎データ構造、シンボルメタデータ、入力スキーマを定義します。ストラテジーおよびモードのResolverは、コードの複雑性と設定コンテキストを評価して処理深度を決定し、一方でスキーマ定義は、安全なコンテンツマージのためのフレームワークと更新プランを確立します。

最後に、実行コンポーネントが操作レイヤーを担当し、ファイル要約の計算、コード変換の実行、特定のAIモデルプロバイダーへの操作ルーティングを行うタスクを実行します。

## インストール

pnpmを使用してインストールします。

```bash
pnpm add @gyomu/ai-compiler
```

## 依存関係

このパッケージはESM実行環境を必須とし、Effect 4.x向けに構築されており、Effectのランタイム、スキーマ、およびcontextをコア基盤として依存しています。共通の型とスキーマには `@gyomu/schema`、基盤となるI/O操作には `@gyomu/infra`、LLM処理のハンドリングには `@gyomu/ai` と統合されます。

## 開発

GyomuプロジェクトにおけるAIコードインテリジェンス基盤を提供する本パッケージは、ソースコード解析、ドキュメント生成、コード要約などのAI処理を宣言的なパイプラインとして構築・実行し、一貫性・再現性・保守性に優れたAI支援開発を実現することを目的としています。コントリビューターは、AI処理を用途ごとに独立したPipelineとして構成し、すべてのAI入落力をSchemaを契約として型安全に扱う必要があります。また、複雑度や対象規模に応じて実行戦略を切り替えられる設計とし、Pipelineを再利用可能なコンポーネントとして組み立てることで、拡張性と保守性を担保します。

安全性と予測可能性を確保するため、アーキテクチャではAnalysisとPlanを明確に分離し、生成内容と変更内容を混在させないことが厳格に求められます。AIによる変更は必ずPlanを経由して安全に適用できる構造としなければなりません。さらに、AIタスクはRouteによって識別することで、モデル構成と処理内容を疎結合に保ちます。コントリビューターはこれらのポリシーを遵守し、コード変換やドキュメント生成における複雑度や深度の制御、および多様なドキュメントフォーマットへの翻訳戦略を実装・発展させていくことが求められます。

## Public API

- JSDoc Updates - Analyzes source code symbols and generates structural update plans to automatically add or modify JSDoc documentation.
- File and Directory Summarization - Processes source files and directories to produce cohesive summaries and concept extractions for codebases.
- AI Model Routing - Defines route identifiers and execution hooks for connecting pipeline tasks to specific AI model providers.
- Document Translation - Provides strategies for translating structured document content including bullet lists, tables, code blocks, and paragraphs.

## ライセンス

MIT