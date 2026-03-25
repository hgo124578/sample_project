# Skills Design: coding / code-review / update-review-notes

**Date:** 2026-03-25
**Status:** Approved

## Overview

プロジェクト横断で使える汎用skillsを3つ作成する。skillsはコーディング・コードレビュー・レビュー指摘更新のワークフローを支援し、以下を徹底する：

- 一般的なベストプラクティスの遵守
- プロジェクト規約の遵守
- 過去PRレビュー指摘の再発防止

## Goals

- Skills本体はプロジェクト固有情報を含まず、汎用的・再利用可能
- GitHub Copilot / Claude Code など複数AIツールで動作する共通規格（SKILL.md形式）に準拠
- プロジェクト固有情報（規約・レビュー指摘）は専用ファイルで管理し、skillsが参照

## Directory Structure

```
<project-root>/
├── .agents/
│   └── skills/
│       ├── coding/
│       │   └── SKILL.md
│       ├── code-review/
│       │   └── SKILL.md
│       └── update-review-notes/
│           └── SKILL.md
├── CLAUDE.md          # or AGENTS.md — path overrides defined here
└── docs/
    └── ai/
        ├── conventions.md    # プロジェクト規約（人間が管理）
        └── review-notes.md   # 過去PRレビュー指摘まとめ（update-review-notesが管理）
```

## Skills Specification

### Skill 1: `coding`

**トリガー（description）:**
「〇〇を実装して」「コードを書いて」など、コードの新規作成・修正を依頼されたとき

**動作フロー:**
1. 設定ファイルからパスを読み取る（後述の「パス設定」参照）
2. `conventions.md` を読む。ファイルが存在しない場合は「規約ファイルが見つかりません。`docs/ai/conventions.md` を作成するか、CLAUDE.md でパスを指定してください」と警告し、ベストプラクティスのみで続行する
3. `review-notes.md` を読む。ファイルが存在しない場合は過去指摘なしとして続行する
4. `review-notes.md` の内容が現在のタスクに関連する場合（例: 同種のコードを書こうとしている）は、実装前に「過去のレビューで〇〇という指摘があります。今回も同様の実装になりますが、意識して対処します」と明示的に宣言してから実装する
5. 一般的なベストプラクティス・規約・過去指摘を全て踏まえて実装する

**目的:** 実装段階で規約違反・過去と同趣旨の指摘を未然に防ぐ

---

### Skill 2: `code-review`

**トリガー（description）:**
「レビューして」「コードレビュー」など、レビューを依頼されたとき

**動作フロー:**
1. ベースブランチを特定する（設定にあれば使用、なければ `git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null` で自動検出、それも失敗したら `main` をデフォルトとして使用）
2. `git diff <base-branch>...HEAD` で現在のブランチのコミット済み差分のみを取得
3. 差分が大きい場合（目安: 500行超）は `git diff --stat <base-branch>...HEAD` でファイル一覧を表示し、ファイル単位でレビューするか確認する
4. 設定ファイルからパスを読み取る
5. `conventions.md` を読む（存在しない場合は警告して続行）
6. `review-notes.md` を読む（存在しない場合は過去指摘なしとして続行）
7. 以下の観点でレビュー結果を出力する

**レビュー出力フォーマット:**

```
## コードレビュー結果

### 🔴 Critical（マージ前に必須対応）
- [ファイル名:行番号] 指摘内容

### 🟡 Important（強く推奨）
- [ファイル名:行番号] 指摘内容

### 🔵 Suggestion（任意改善）
- [ファイル名:行番号] 指摘内容

### ✅ 問題なし
問題がない場合はここに記載
```

**目的:** PRレビュー前にAIセルフレビューで指摘を潰す

---

### Skill 3: `update-review-notes`

**トリガー（description）:**
「レビュー指摘を記録して」「PRのレビューを更新して」など、レビュー指摘の記録を依頼されたとき

**動作フロー:**
1. リポジトリの owner/repo を `gh repo view --json owner,name` で取得する（HTTPS・SSH両形式に対応）
2. `gh api repos/{owner}/{repo}/pulls?state=all&per_page=100` でリポジトリの全PR一覧を取得する
3. `review-notes.md` のメタデータセクションを読み、各PRの `last_fetched_at` を確認する
   - 未処理のPR: 全コメントを取得対象とする
   - 処理済みのPR: `last_fetched_at` 以降に作成されたコメントのみを取得対象とする（差分取得）
4. 各PRに対して以下のコマンドでレビューコメントを取得。`user.type === "Bot"` のコメントと `last_fetched_at` 以前のものを除外する：
   ```bash
   # PRレビュー（Approve/Request changes等）
   gh api repos/{owner}/{repo}/pulls/{number}/reviews
   # インラインコメント
   gh api repos/{owner}/{repo}/pulls/{number}/comments
   ```
5. 全PRから収集した新しいコメントを抽出・要約・分類する。新しいコメントが1件もなければ「新しい指摘はありませんでした」と報告して終了する
6. `review-notes.md` の本文に追記する。重複の判定基準：**同じ分類カテゴリ内で指摘の意図が同じもの**（同種指摘はマージして記述を充実させる。別の例を追記するのはOK）
7. `review-notes.md` のメタデータセクションを全PRの `last_fetched_at` を現在時刻に更新する

**目的:** 人間がレビューを受けた後、次回以降の再発を防ぐために指摘を蓄積する

---

## Project-Specific Path Configuration

### デフォルトパス

| ファイル | デフォルトパス |
|---------|--------------|
| 規約 | `docs/ai/conventions.md` |
| レビュー指摘 | `docs/ai/review-notes.md` |
| ベースブランチ | `main`（自動検出を試みてからフォールバック） |

### パスのカスタマイズ

`CLAUDE.md` または `AGENTS.md` 内の以下の**構造化ブロック**で上書き可能：

```markdown
<!-- ai-skills-config -->
conventions: docs/project-rules.md
review-notes: docs/review-history.md
base-branch: develop
<!-- /ai-skills-config -->
```

Skillsは `<!-- ai-skills-config -->` と `<!-- /ai-skills-config -->` で囲まれたブロックを読み取り、`key: value` 形式でパースする。ブロックが存在しない場合はデフォルトパスを使用する。

---

## `conventions.md` テンプレート

プロジェクト規約ファイルの最小構成：

```markdown
# プロジェクト規約

## コーディング規約
- （例）関数はアロー関数で統一する
- （例）型定義は必ずTypeScriptの型/interfaceを使う

## ファイル・ディレクトリ命名規則
- （例）コンポーネントはPascalCase
- （例）ユーティリティはcamelCase

## コンポーネント設計
- （例）Server ComponentとClient Componentを明示的に分離する

## その他
- （例）コメントは日本語で書く
```

---

## `review-notes.md` テンプレート

レビュー指摘ファイルの構造（`update-review-notes` が維持する）：

```markdown
# レビュー指摘まとめ

## 型・型安全性
- 【指摘】Props に型定義がない場合は必ず TypeScript の interface/type を使う
  - 例: PR#1 で `stopFnRef` の型が `any` になっていた → `MutableRefObject<(() => void) | null>` に修正

## コンポーネント設計
- 【指摘】Client Component には `"use client"` ディレクティブを明示する
  - 例: PR#2 でインタラクティブなコンポーネントにディレクティブが抜けていた

## 命名規則
- （指摘が蓄積されたらここに追記）

## その他
- （指摘が蓄積されたらここに追記）

---
<!-- ai-review-notes-metadata
pr_1:
  last_fetched_at: "2026-03-25T10:00:00Z"
pr_2:
  last_fetched_at: "2026-03-25T15:30:00Z"
-->
```

**フォーマット規則:**
- カテゴリは `##` 見出しで分類する
- 各指摘は「【指摘】〜すべき」という形式で書く
- 具体例は `- 例: PR#番号 で〜` の形式でインデントして追記する
- 同カテゴリ・同意図の指摘は既存エントリに例として追記（重複エントリを作らない）

---

## Compatibility

| ツール | 対応 |
|--------|------|
| Claude Code | ✅ |
| GitHub Copilot (VS Code) | ✅ |
| GitHub Copilot CLI | ✅ |
| Cursor | 確認中（SKILL.md形式の読み込みサポート次第） |

Skills は [VS Code Agent Skills open standard](https://code.visualstudio.com/docs/copilot/customization/agent-skills) に準拠した `SKILL.md` 形式を使用。

**SKILL.md 必須フィールド:**

| フィールド | 説明 | 上限 |
|-----------|------|------|
| `name` | skill識別子（小文字・ハイフン区切り） | 64文字 |
| `description` | いつ使うかのトリガー説明（"Use when..."形式） | 1024文字 |

## Out of Scope

- skillsの自動テスト（TDDサイクルは別途実施）
- Cursor専用フォーマットへの変換
- CIへの組み込み
- スタックPR・サブディレクトリ限定レビュー（将来対応）
