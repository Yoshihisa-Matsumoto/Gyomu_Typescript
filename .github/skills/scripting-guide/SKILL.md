---
name: scripting-guide
description: ワンライナーや小規模スクリプトでのデータ処理方法を解説するガイド。Python等で小規模なスクリプトを実行しようとする場合には、必ずこのスキルを参照して従ってください。
---

# データ処理スクリプト作成ガイド（JavaScript/TypeScript file-based apps）

このスキルは、JavaScript/TypeScript file-based apps を使ってファイルを作らずにデータ処理を行う方法を提供します。

**適用バージョン:** Node.js 24以降

## 基本方針

コードは **必ず `playground/ai` ディレクトリの下でパイプで `tsx` に渡して実行** してください。
`Set-Content` や `Out-File` 等で `.ts` ファイルを新規作成してから実行する方法は **禁止** です。
ファイルの保存場所は指定がない場合、同様に**必ず　`playground/ai` ディレクトリの下に保存**してください。

**優先順位:**

1. **パイプ実行（必須）:** コード文字列を `tsx` に直接パイプして実行する
2. **既存ファイル実行:** プロジェクトに既に存在する `.ts` ファイルを `tsx <file>.ts` で実行する

外部ライブラリが必要な場合、パイプ実行で対応できます（後述の「外部ライブラリを使う場合」を参照）。

## ワンライナー実行（最優先）

### 基本

**PowerShell:**
```powershell
"console.log('Hello');" | tsx
```

**Bash:**
```bash
echo "console.log('Hello');" | tsx
```

### 複数行

**PowerShell:**
```powershell
@'
const greet = (name: string): string => `Hello, ${name}!`;
console.log(greet("World"));
'@ | tsx
```

**Bash:**
```bash
tsx  << 'EOF'
const greet = (name: string): string => `Hello, ${name}!`;
console.log(greet("World"));
EOF
```

## 標準ライブラリでの処理

### JSON処理（パッケージ不要）

`json.ts`:
```typescript
type User = { id: number; name: string; email: string; active?: boolean };

// サンプル JSON をコード内に文字列で保持（外部ファイルを使わない）
const jsonString = `[
  {"id":1,"name":"Alice","email":"alice@example.com","active":true},
  {"id":2,"name":"Bob","email":"bob@example.com","active":false},
  {"id":3,"name":"Carol","email":"carol@example.com"}
]`;

async function main() {
  // パース（実際には同期だが async 関数にしておくと将来の拡張が楽）
  const users = JSON.parse(jsonString) as User[];

  // active が false のものを除外して必要なフィールドだけ残す
  const active = users
    .filter(u => u.active !== false)
    .map(({ id, name, email }) => ({ id, name, email }));

  // 結果を JSON 文字列にして出力
  console.log(JSON.stringify(active, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
```

実行:
```powershell
'{"name":"太郎"}' | dotnet json.cs
```

## 外部ライブラリを使う場合

必ず事前にplayground/aiに移ってから実行すること
必要な外部ライブラリはpnpm install -D を使ってインストールしてから実行すること

### CSV処理

```powershell
@'
import fs from "fs";
import { parse } from "csv";

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("使い方: node countCsv.js <csv-file>");
  process.exit(2);
}

const file = args[0];
const parser = parse({ trim: true });

let count = 0;
fs.createReadStream(file)
  .pipe(parser)
  .on("data", () => { count++; })
  .on("end", () => { console.log(`レコード数: ${count}`); })
  .on("error", (err) => { console.error("エラー:", err); process.exit(1); });

'@ | tsx - -- data.csv
```

### Excel処理

```powershell
@'
@'
import fs from "fs";
import ExcelJS from "exceljs";

const [file] = process.argv.slice(2);
if (!file) { console.error("usage: node readExcel.js <file.xlsx>"); process.exit(2); }

(async () => {
  if (!fs.existsSync(file)) { console.error("file not found"); process.exit(1); }
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const ws = wb.worksheets[0];
  if (!ws) return;
  ws.eachRow((row) => {
    const v = row.getCell(1).value;
    if (v != null && String(v).trim() !== "") console.log(v);
  });
})();
'@ | tsx - -- Employee.xlsx
```

## よく使うライブラリ

| 用途 | パッケージ | 備考 |
|------|---------------|------|
| JSON処理 | （不要） | 標準でできる|
| CSV処理 | csv csv-parse | |
| Excel処理 | exceljs | |

## 実用パターン

### 標準入力とファイル引数の両対応

```typescript
import fs from "fs/promises";

const [file] = process.argv.slice(2);

async function main() {
  const input = file ? await fs.readFile(file, "utf-8") : await new Promise<string>(r => {
    let s = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", c => s += c);
    process.stdin.on("end", () => r(s));
  });
  console.log(input.toUpperCase());
}

main().catch(e => { console.error(e); process.exit(1); });
```

使い方:
```powershell
# ファイルから
tsx script.ts -- input.txt

# 標準入力から
Get-Content input.txt | tsx script.ts
```

### エラーハンドリング

```typescript
try
{
    // 処理
    return 0;
}
catch (err: unknown =>
{
    console.log(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
}
```

## 参考資料

- [tsx](https://github.com/privatenumber/tsx)
- [Node.js stdin spec](https://nodejs.org/api/process.html)