# プロジェクト規約

> このファイルはAIエージェント（coding / code-review スキル）がコード品質を保つための規約を記録します。
> 各セクションの内容は実際のプロジェクトの状況に合わせて更新してください。

## コーディング規約

- TypeScript（`.tsx`）と JavaScript（`.js`）が混在している。新規ファイルはTypeScript（`.tsx`）を使用する
- TypeScriptの strict モードはオフ（`tsconfig.json`）だが、型定義は積極的に付ける
- `any` 型の使用は避ける。特に `useRef` の型引数は明示する（例: `useRef<(() => void) | null>(null)`）
- コメントは日本語で書く
- ESLintは `next/core-web-vitals` に準拠する

## ファイル・ディレクトリ命名規則

- ページコンポーネントのファイル名は `page.js` / `page.tsx`（App Routerの規約）
- ディレクトリ名はkebab-case（例: `rrweb-record`, `performance-test`）
- コンポーネント関数名はPascalCase（例: `RrwebRecordPage`, `Home`）
- ユーティリティ関数名はcamelCase

## コンポーネント設計

- App Router（`app/` ディレクトリ）を使用する
- ページはそれぞれのディレクトリに `page.js`/`page.tsx` として配置する
- インタラクティブな操作（useState, useRef, イベントハンドラ等）を含むコンポーネントには先頭に `'use client'` ディレクティブを付ける
- Server Component（ディレクティブなし）をデフォルトとし、必要な場合のみ Client Component にする
- スタイリングはTailwind CSSのclassNameで行う（外部CSSファイルは `globals.css` のみ）

## その他

- `metadata` オブジェクトのエクスポートはServer Componentでのみ行う
- UIテキストは日本語で書く
