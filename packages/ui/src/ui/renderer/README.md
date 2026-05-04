# renderer

## 役割

DSLやFormModelなどの**抽象データをUI構造に変換する層**。

- coreで定義されたデータ構造を受け取る
- UIライブラリに依存した描画構造へマッピングする

## 責務

- FormModel → JSXツリー への変換
- フィールド種別ごとの描画振り分け
- layout / field の組み立て

## やらないこと

- ビジネスロジックを持たない
- schema解析をしない（それはcore/engine）
- UIコンポーネントの実装を持たない（それはadapter）

## 依存関係

- core には依存してよい
- adapter を利用してよい
