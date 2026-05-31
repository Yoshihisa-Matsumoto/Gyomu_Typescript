# パスモデル

## 目的

本ドキュメントは、本プロジェクトで使用するパス関連の用語と取り扱いルールを定義する。

解析・依存関係・Snapshot・TSDoc生成など、複数の機能が同じパス表現を利用するため、
システム全体で一貫したルールを維持することを目的とする。

---

# 用語

## 絶対パス (Absolute Path)

OSルートから始まるファイルパス。

例:

```text
/workspace/project/src/user/UserService.ts
```

Windows:

```text
C:\workspace\project\src\user\UserService.ts
```

特徴:

- OS依存
- ファイル操作に利用する
- 永続的な識別子としては利用しない

---

## プロジェクト相対パス (Project Relative Path)

プロジェクトルートからの相対パス。

例:

```text
src/user/UserService.ts
```

特徴:

- `/` を使用する
- OS非依存
- 安定した識別子として利用できる
- システム内部の標準パス表現

---

## モジュール指定子 (Module Specifier)

ソースコード内の import/export に記述される参照文字列。

例:

```ts
import { User } from '../model/User.js'
```

モジュール指定子:

```text
../model/User.js
```

特徴:

- import/export文に現れる
- 参照元ファイル基準
- 実行時拡張子(.js/.mjs/.cjs)を持つ

---

## ソースパス (Source Path)

TypeScriptソースコードを表すパス。

例:

```text
src/model/User.ts
```

特徴:

- プロジェクト相対パス
- ソースコードを指す

---

## 出力パス (Output Path)

ビルド成果物を表すパス。

例:

```text
dist/model/User.js
```

特徴:

- プロジェクト相対パス
- コンパイル後の成果物を指す

---

# 標準表現

システム内部では以下を標準パス表現とする。

```text
プロジェクト相対パス
```

例:

```text
src/user/UserService.ts
```

可能な限り、他のパス表現はこの形式へ変換して扱う。

---

# パス変換ルール

## 絶対パス → プロジェクト相対パス

使用関数:

```ts
toProjectRelativePath()
```

例:

```text
/workspace/project/src/user/User.ts
↓
src/user/User.ts
```

---

## プロジェクト相対パス → 絶対パス

使用関数:

```ts
toProjectAbsolutePath()
```

例:

```text
src/user/User.ts
↓
/workspace/project/src/user/User.ts
```

---

## 出力パス → ソースパス

使用関数:

```ts
mapOutputPathToSourcePath()
```

例:

```text
dist/user/User.js
↓
src/user/User.ts
```

---

## ソースパス → 出力パス

使用関数:

```ts
mapSourcePathToOutputPath()
```

例:

```text
src/user/User.ts
↓
dist/user/User.js
```

---

## モジュール指定子 → ソースパス

使用関数:

```ts
moduleSpecifierToSourcePath()
```

例:

```text
../model/User.js
↓
src/model/User.ts
```

---

## ソースパス → モジュール指定子

使用関数:

```ts
sourcePathToModuleSpecifier()
```

例:

```text
src/model/User.ts
↓
../model/User.js
```

---

# Symbol Identity

Symbol ID はプロジェクト相対パスを基準に生成する。

例:

```text
src/user/UserService.ts::UserService.getUser
```

理由:

- OS差異の影響を受けない
- 開発環境に依存しない
- 再解析時も安定する
- SnapshotやMerge処理と相性が良い

絶対パスを Symbol ID に含めてはならない。

---

# 設計原則

## プロジェクト相対パスを優先する

複数のパス表現が存在する場合は、プロジェクト相対パスを優先する。

推奨:

```text
src/user/UserService.ts
```

非推奨:

```text
/workspace/project/src/user/UserService.ts
```

---

## パス区切り文字を統一する

プロジェクト相対パスでは常に以下を使用する。

```text
/
```

使用しない:

```text
\
```

Windows環境でも内部表現は `/` に統一する。

---

## ファイルパスとモジュール指定子を区別する

以下は異なる概念である。

ファイルパス:

```text
src/model/User.ts
```

モジュール指定子:

```text
../model/User.js
```

混同しないこと。

必要に応じて変換関数を使用すること。

---

# 今後の利用方針

以下の機能ではプロジェクト相対パスを標準形式として利用する。

- Symbol Identity
- Dependency Graph
- Snapshot
- Project Change Analysis
- TSDoc生成
- Safe Merge
- AI管理領域

これらの機能間でパス表現を統一することで、安定した差分検出と更新処理を実現する。
