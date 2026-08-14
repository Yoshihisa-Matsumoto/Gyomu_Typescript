# Gyomu Schema

[US English](README.md) | JP 日本語

## 概要

`@gyomu/schema` パッケージは Gyomu プロジェクトの基盤層として機能し、共有スキーマ、型定義、サービス定義、およびドメイン非依存のユーティリティを提供します。その主な目的は、パッケージ間で共通の契約を確立し、厳格な型安全性と一貫性を確保しながら、疎結合な協業を可能にすることです。

Effect と Standard Schema を基盤に構築されており、包括的かつドメイン駆動のアプローチによる検証を提供します。必須のエラーハンドリング構造、コアエンティティ定義、自動化された CRUD スキーマジェネレータに加え、ソースコードやメタデータを解析するための高度なツールを提供します。

## アーキテクチャ

このパッケージは、基盤インフラストラクチャ、ドメインモデリング、特殊な解析の各領域に責任を分割する専用のディレクトリで構成されています。

コアインフラストラクチャ層は、低水準のユーティリティ、JSONのスキーマ表現、および一元化されたエラー処理戦略を提供します。フレームワーク全体で使用される、標準化された結果ラッパー、診断コンテキスト、運用ポリシーを確立します。

ドメイン固有のロジックは、エンティティおよびビジネス構造の定義を通じて管理されます。これらのコンポーネントは、再利用可能なフィールド定義、UIアノテーション、日付処理ルーチンを提供し、ビジネスエンティティおよびシステム設定用の完全なCRUDスキーマスイートを自動的に生成します。

最後に、TypeScript解析層は、コードのメタデータ、シンボル、インポート、エクスポート、型プロパティを検証するための構造モデルを提供し、ドキュメントおよび解析ツール向けの統一された表現を可能にします。これらのコンポーネントが連携することで、アプリケーション全体で型安全性、データの一貫性、堅牢な検証が維持されます。

## インストール

pnpmを使用してインストールします。

```bash
pnpm add @gyomu/schema
```

## 依存関係

このパッケージはESM実行環境を必須とし、Effectバージョン4.x向けに特別に構築されています。コアランタイム、スキーマ、コンテキスト管理を `effect` エコシステムに依存しています。さらに、日付と時刻の型およびユーティリティの処理には `date-fns` を使用します。

## 開発

Gyomu プロジェクト全体で共有されるスキーマ、型定義、サービス定義、および特定パッケージに依存しないユーティリティを提供し、パッケージ間で共通の契約（Contract）を定義することで、型安全性と一貫性を保ちながら各パッケージが疎結合に連携できる基盤となることを目的とする。

コントリビューターが守るべき設計原則として、パッケージ間で共有されるデータ、永続化されるデータ、ランタイムで検証が必要なデータはすべて Effect Schema として定義し、ブランド型（Brand）も共有して利用できるよう本パッケージに配置する。スキーマの Annotation はランタイムだけでなく、AI によるコード生成・ドキュメント生成・知識生成にも利用されるため省略せずに記述する。サービス定義は共有が必要なものに限定し、インターフェースと Context Tag のみ定義して実装は行わない。ユーティリティは純粋関数とし、Gyomu の他パッケージへ決して依存させてはならない。

さらに、API は可能な限りイミュータブルかつ宣言的に設計し、エラー型は共通構造を持って他パッケージの実装例となるように構築する。スキーマ・型定義・サービス定義は常に再利用性を優先して設計を行い、これらの原則を維持しながらパッケージを継続的に発展させる。

## Public API

- Entity Schema Generation - Defines business entity structures and automatically generates corresponding insert, update, and select CRUD schemas.
- Domain Error Handling - Provides classified application errors equipped with operational logging policies, context metadata, and retryability traits.
- TypeScript Code Analysis Schemas - Supplies rich structural models for analyzing symbols, type properties, imports, exports, and JSDoc annotations.
- Result and Validation Flow - Encapsulates operation outcomes using standardized success and failure result schemas with integrated field-level error mapping.
- Date and Time Utilities - Handles local dates, year-month periods, and business calendar transformations required by domain entities.

## ライセンス

MIT