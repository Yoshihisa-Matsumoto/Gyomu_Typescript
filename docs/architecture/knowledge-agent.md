# Knowledge Agent

## 目的

本プロジェクトでは、ソースコードから得られる知識と、設計者のみが持つ知識を分離して管理する。
この Knowledge は「ドキュメントの入力」ではなく、プロジェクトの唯一の人間管理知識（Single Source of Truth for Human Knowledge） と位置付ける

目的は以下である。

- README.md / Concept.md の自動生成
- 人手によるドキュメント保守の最小化
- LLMが理解しやすい知識の提供
- 開発者への設計情報の提供
- Claude.md 等のAI向けドキュメント生成
- 将来的なProjectレベルのドキュメント生成

---

# 基本方針

知識は以下の2種類に分類する。

```
Code Knowledge
（コードから導出）

+
Human Knowledge
（設計者のみが保持）

↓

Documents
```

コードから得られる知識は可能な限り自動生成し、人間はコードから導出できない知識のみを管理する。

---

# Code Knowledge

現在生成可能な知識は以下である。

```
TSDoc
    ↓

File Summary
    ↓

Directory Concept
    ↓

Package Concept
```

これらはすべてソースコードから生成される。

---

# Human Knowledge

設計者のみが持つ知識を構造化して管理する。

この知識はREADME専用ではなく、プロジェクト全体で再利用可能な知識ベースとする。

```
Package Knowledge
```

将来的には

```
Project Knowledge
```

も同じ概念で管理する。

---

# ドキュメント生成

Knowledgeは複数のドキュメントへ変換される。

```
               PackageAnalysis
                     │
               PackageConcept
                     │
                     │
             PackageKnowledge
                     │
      ┌────────┼────────┐
      │        │        │
   README   Concept   Claude.md
      │        │        │
      └────────┼────────┘
               │
        Project Concept
               │
        Project README
```

Knowledge自体は出力形式を持たず、それぞれのドキュメントに応じてLLMが文章へ昇華する。

---

# READMEとConceptの役割

READMEは利用者向けであり、

- 何をするものか
- どう使うか
- API
- サンプル

などを説明する。

Conceptは開発者向けであり、

- なぜ存在するか
- 責務
- 設計思想
- 制約
- 将来方針

などを説明する。

---

# README構成

例

```
Package Name

Overview

Purpose

Features

Installation

Usage

Concepts

Public APIs

Examples

Notes

Related Packages
```

---

# Concept構成

例

```
Mission

Responsibility

Non Goals

Design

Architecture

Domain Model

Dependencies

Constraints

Future
```

---

# 情報の分類

## コードから生成可能

- Overview
- Purpose
- Features
- Responsibility
- Architecture
- Domain Model
- Dependencies
- Public APIs
- Related Packages

主にPackageConceptおよびAnalysisから生成できる。

---

## 一部生成可能

コードだけでは不足するもの。

- Usage
- Mission
- Design
- Constraints
- Examples
- Notes

人間の知識を入力としてLLMが文章化する。

---

## 人が管理する必要があるもの

- Installation
- Non Goals
- Future
- 利用時の注意
- 設計意図
- ポリシー

これらはコードから導出できない。

---

# Human Knowledgeの分類

人間が管理する情報は文章ではなく知識として管理する。

## Fact

事実。

例

- Node.js only
- ESM only

---

## Intent

設計意図。

例

- Repositoryを採用する理由
- Effectを採用する理由

---

## Policy

設計ルール。

例

- Controllerは禁止
- index.tsのみ公開
- ErrorはEffect Errorのみ

---

## KnowHow

利用ノウハウ。

例

- 最初に○○を利用する
- 大量データでは△△を利用する

---

# Knowledgeの形式

KnowledgeはREADME用データではない。

出力形式を持たない知識ベースである。

例

```yaml
mission: |
  ...

constraints:
  - Node.js only
  - ESM only

policies:
  - Export only from index.ts
  - Use Effect errors

nonGoals:
  - UI
  - Database migration

usage:
  - ...

examples:
  - ...

terminology:
  - ...
```

---

# YAMLを採用する理由

Knowledgeは人間が継続的に編集する。

そのため、

- 可読性
- 編集しやすさ
- Git差分の見やすさ

を重視し、YAMLを採用する。

JSONは内部形式として利用する。

---

# Effect Schema

KnowledgeはEffect Schemaで管理する。

理由

- バリデーション
- 型安全
- LLM入力との統一
- エディタ補完
- バージョン管理

YAMLはSchemaへデコードして利用する。

---

# LLMの役割

人間は知識のみを書く。

例

```yaml
policies:
  - Export only from index.ts
  - Serviceは公開しない
```

LLMは用途に応じて文章へ昇華する。

READMEでは

- 利用者向け文章

Conceptでは

- 設計説明

Claude.mdでは

- 開発ルール

など、それぞれ異なる表現へ変換する。

Knowledgeは単一であり、ドキュメントは複数生成される。

---

# 将来構想

Knowledgeの階層を揃える。

```
ProjectKnowledge

PackageKnowledge

(DirectoryKnowledge)

(FileKnowledge)
```

これにより、

- README
- Concept
- Claude.md
- AIレビュー
- 設計レビュー
- Project Documentation

など、すべて同じKnowledgeを利用できる設計を目指す。
