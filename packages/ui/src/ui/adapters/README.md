# adapters

## 役割

特定のUIライブラリ（MUIなど）に依存した**具体的なUIコンポーネントの実装層**。

## 責務

- Button, Input, Field などの実体コンポーネント提供
- UIライブラリのラップ
- デザインシステムの適用

## やらないこと

- DSLやschemaを解釈しない
- レンダリングの分岐ロジックを持たない（それはrenderer）
- ビジネスロジックを持たない

## 例

- MuiTextField
- MuiSubmitButton
- MuiFormLayout

## 依存関係

- 外部UIライブラリ（MUIなど）に依存してよい
- core には依存しない（重要）
