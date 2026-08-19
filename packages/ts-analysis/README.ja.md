# Gyomu TS Analysis

[US English](README.md) | JP 日本語

## 概要

このパッケージは、Gyomuをサポートするために設計された堅牢なTypeScriptの静的解析およびワークスペース探索パイプラインを提供します。主な目的は、プロジェクト全体を静的に解析して、ソースコードの構造、シンボル、依存関係を構造化された解析モデルとして抽出することです。

ファイルシステムのキャッシュとパスの解決を管理することで、開発者はプロジェクトのコンテキストを初期化し、ソースファイルとパッケージのメタデータの両方を解析できます。得られた解析データは永続的かつ再利用可能な形式で管理され、人工知能やドキュメント生成ツールなどの上位層が確実利用できる共通の解析基盤を確立します。

## アーキテクチャ

このパッケージは、ワークスペースの検出、パス管理、結果の永続化を行う専門モジュール群に支えられたコアの静静的解析パイプラインを中心に構成されています。そのアーキテクチャは、実行環境のセットアップ、ファイルの検査、変換を処理する協調的なコンポーネント間で責任を分担させています。

解析エンジンは、TypeScriptのソースファイルの検査をオーケストレーションし、プロジェクト全体のコンテキストを管理します。インクリメンタルなワークフローのために、永続化層を利用して解析メタデータをファイルシステムにキャッシュします。同時に、ワークスペースおよびプロジェクトの検出コンポーネントが設定とパッケージのメタデータを特定し、実行環境の包括的なビューを確立します。

共有ユーティリティ層は、パスの正規化、絶対パスから相対パスへの変換、ソースファイルとビルド出力間のモジュール指定子のマッピングを処理することで、これらの操作を支えています。ルートインターフェースはこれらの機能を統合し、利用者に対して統一されたエントリーポイントを提供します。

## インストール

pnpm を使用してインストールします。

```bash
pnpm add @gyomu/ts-analysis
```

## 依存関係

このパッケージにはESMの実行環境が必要であり、Effectバージョン4.x向けに構築されています。コアの基盤としてEffectランタイムとスキーマに依存し、共有型には`@gyomu/schema`、入出力操作には`@gyomu/infra`を使用します。さらに、TypeScriptのコード解析には`ts-morph`を使用します。

## 開発

GyomuにおけるTypeScriptソースコード解析基盤は、プロジェクト全体を静的解析し、ソースコードの構造、シンボル、依存関係を構造化された解析モデルとして抽出・永続化することで、AIやドキュメント生成など上位レイヤーが利用する共通の解析基盤を提供することを目的としています。この基盤において、解析結果は常にソースコードから導出されるものとし、ソースコードを変更せず読み取り専用として扱います。また、TypeScriptプロジェクト境界を明確に管理し、上位レイヤーは解析結果のみを利用して `ts-morph` 等の内部実装へ直接依存しない設計を徹底します。

コントリビューターが守るべきアーキテクチャ上の原則として、プロジェクト解析とファイル解析は独立した責務として設計されています。解析結果は永続化層を介して管理され、差分更新や再利用を可能にすることで効率的なワークフローを支えます。さらに、パス解決はWorkspace全体で一貫したルールに従うとともに、モジュール解決と解析処理は疎結合に設計されており、各コンポーネントが独立して拡張・検証できる構造を維持することが求められます。

## Public API

- TypeScript Static Analysis - Inspects and processes TypeScript source files to extract semantic information, symbols, and code structures.
- Project and Workspace Discovery - Locates and analyzes workspace projects, package configurations, and dependency catalogs to build a complete project environment view.
- Analysis Persistence - Saves and retrieves file analysis results to and from disk for efficient caching and incremental operations.
- Path Resolution and Mapping - Normalizes paths, translates between absolute and relative locations, and maps module specifiers and build outputs to source files.

## ライセンス

MIT