# Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 3つの汎用SKILL.md（coding / code-review / update-review-notes）を作成し、コーディング・レビュー・指摘蓄積のワークフローを支援する。

**Architecture:** SKILL.md形式（YAMLフロントマター + Markdownボディ）で各skillを記述。プロジェクト固有情報（規約・レビュー指摘）は `docs/ai/` 配下のファイルに分離し、skillsは汎用ロジックのみを持つ。パスのカスタマイズは `CLAUDE.md` / `AGENTS.md` の `<!-- ai-skills-config -->` ブロックで行う。

**Tech Stack:** SKILL.md open standard（VS Code Agent Skills互換）、GitHub CLI（`gh`）、Git

---

## File Map

| 操作 | パス | 内容 |
|------|------|------|
| 作成 | `.agents/skills/coding/SKILL.md` | codingスキル本体 |
| 作成 | `.agents/skills/code-review/SKILL.md` | code-reviewスキル本体 |
| 作成 | `.agents/skills/update-review-notes/SKILL.md` | update-review-notesスキル本体 |
| 作成 | `docs/ai/conventions.md` | プロジェクト規約テンプレート |
| 作成 | `docs/ai/review-notes.md` | レビュー指摘テンプレート |

---

## Task 1: ディレクトリ構造とテンプレートファイルの作成

**Files:**
- Create: `.agents/skills/coding/SKILL.md`（ディレクトリ作成のみ）
- Create: `.agents/skills/code-review/SKILL.md`（ディレクトリ作成のみ）
- Create: `.agents/skills/update-review-notes/SKILL.md`（ディレクトリ作成のみ）
- Create: `docs/ai/conventions.md`
- Create: `docs/ai/review-notes.md`

- [ ] **Step 1: ディレクトリを作成する**

```bash
mkdir -p .agents/skills/coding
mkdir -p .agents/skills/code-review
mkdir -p .agents/skills/update-review-notes
mkdir -p docs/ai
```

- [ ] **Step 2: `docs/ai/conventions.md` を作成する**

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

- [ ] **Step 3: `docs/ai/review-notes.md` を作成する**

```markdown
# レビュー指摘まとめ

## 型・型安全性
- （指摘が蓄積されたらここに追記）

## コンポーネント設計
- （指摘が蓄積されたらここに追記）

## 命名規則
- （指摘が蓄積されたらここに追記）

## その他
- （指摘が蓄積されたらここに追記）

---
<!-- ai-review-notes-metadata
-->
```

- [ ] **Step 4: ファイルが正しく作成されているか確認する**

```bash
ls .agents/skills/
ls docs/ai/
```

Expected: `coding/  code-review/  update-review-notes/` と `conventions.md  review-notes.md`

- [ ] **Step 5: コミット**

```bash
git add docs/ai/conventions.md docs/ai/review-notes.md
git commit -m "feat: add project conventions and review-notes templates"
```

---

## Task 2: `coding` skill の作成

**Files:**
- Create: `.agents/skills/coding/SKILL.md`

**このskillの役割:** 実装依頼を受けたとき、プロジェクト規約と過去のレビュー指摘を踏まえてコードを書く。

- [ ] **Step 1: `.agents/skills/coding/SKILL.md` を作成する**

以下の内容をそのまま書く（descriptionは1024文字以内、"Use when..."形式）：

````markdown
---
name: coding
description: Use when asked to write, implement, or modify code. Ensures implementation follows project conventions, general best practices, and lessons learned from past PR reviews.
---

# Coding

## Overview

実装依頼を受けたとき、以下の3つのインプットを踏まえてコードを書く：

1. 一般的なベストプラクティス
2. このプロジェクトの規約（`docs/ai/conventions.md`）
3. 過去のPRで受けたレビュー指摘（`docs/ai/review-notes.md`）

## How to Use

### Step 1: 設定を読む

`CLAUDE.md` または `AGENTS.md` 内に `<!-- ai-skills-config -->` ブロックがあれば、そこからパスを読み取る：

```
<!-- ai-skills-config -->
conventions: docs/project-rules.md
review-notes: docs/review-history.md
base-branch: develop
<!-- /ai-skills-config -->
```

ブロックがなければデフォルトパスを使用：
- conventions: `docs/ai/conventions.md`
- review-notes: `docs/ai/review-notes.md`

### Step 2: 規約ファイルを読む

設定から特定したパスのファイルを読む。

ファイルが存在しない場合：
> ⚠️ 規約ファイルが見つかりません（`docs/ai/conventions.md`）。ファイルを作成するか、CLAUDE.md でパスを指定してください。ベストプラクティスのみで続行します。

### Step 3: レビュー指摘ファイルを読む

設定から特定したパスのファイルを読む。ファイルが存在しない場合は過去指摘なしとして続行する（警告不要）。

### Step 4: 関連する過去指摘を宣言する

`review-notes.md` の内容が今回のタスクに関連する場合（例: 同種のコンポーネントを書く、同じライブラリを使う）、実装前に明示的に宣言する：

> 📌 過去のレビューで以下の指摘があります。今回の実装で意識して対処します：
> - [関連する指摘の内容]

### Step 5: 実装する

規約・ベストプラクティス・過去指摘を全て踏まえて実装する。
````

- [ ] **Step 2: frontmatterを検証する**

以下の条件を目視で確認する：
- `name:` が `coding` になっている
- `description:` が "Use when..." で始まっている
- `description:` が1024文字以内である
- YAMLフロントマターが `---` で正しく囲まれている

- [ ] **Step 3: コミット**

```bash
git add .agents/skills/coding/SKILL.md
git commit -m "feat: add coding skill"
```

---

## Task 3: `code-review` skill の作成

**Files:**
- Create: `.agents/skills/code-review/SKILL.md`

**このskillの役割:** レビュー依頼を受けたとき、git diffを取得し、規約と過去指摘の観点で構造化されたレビューを出力する。

- [ ] **Step 1: `.agents/skills/code-review/SKILL.md` を作成する**

````markdown
---
name: code-review
description: Use when asked to review code, check a pull request, or review changes before merging. Reviews git diff against project conventions and past PR review lessons.
---

# Code Review

## Overview

レビュー依頼を受けたとき、以下を踏まえて構造化されたレビュー結果を出力する：

1. 現在のブランチとベースブランチの差分（コミット済みのみ）
2. プロジェクト規約（`docs/ai/conventions.md`）
3. 過去のPRで受けたレビュー指摘（`docs/ai/review-notes.md`）
4. 一般的なベストプラクティス

## How to Use

### Step 1: 設定を読む

`CLAUDE.md` または `AGENTS.md` 内に `<!-- ai-skills-config -->` ブロックがあれば、そこからパスとベースブランチを読み取る：

```
<!-- ai-skills-config -->
conventions: docs/project-rules.md
review-notes: docs/review-history.md
base-branch: develop
<!-- /ai-skills-config -->
```

ブロックがなければデフォルト：
- conventions: `docs/ai/conventions.md`
- review-notes: `docs/ai/review-notes.md`
- base-branch: 自動検出 → `main`

### Step 2: ベースブランチを特定する

1. 設定ブロックに `base-branch` があればそれを使う
2. なければ `git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null` で自動検出
3. 取得できない場合は `main` をデフォルトとして使用

### Step 3: 差分を取得する

```bash
git diff <base-branch>...HEAD
```

差分が500行を超える場合は先に統計を表示し、ファイル単位でレビューするか確認する：

```bash
git diff --stat <base-branch>...HEAD
```

> 差分が大きいです（XXX行）。ファイル単位でレビューしますか？それとも全体をまとめてレビューしますか？

### Step 4: 規約・指摘ファイルを読む

- `conventions.md` を読む（存在しない場合は警告して続行）
- `review-notes.md` を読む（存在しない場合は過去指摘なしとして続行）

### Step 5: レビュー結果を出力する

以下のフォーマットで出力する：

```
## コードレビュー結果

### 🔴 Critical（マージ前に必須対応）
- [ファイル名:行番号] 指摘内容

### 🟡 Important（強く推奨）
- [ファイル名:行番号] 指摘内容

### 🔵 Suggestion（任意改善）
- [ファイル名:行番号] 指摘内容

### ✅ 問題なし
（指摘がない場合）
```

**判定基準:**
- 🔴 Critical: バグ・セキュリティ問題・ビルドが壊れる・規約の重大な違反
- 🟡 Important: 規約違反・過去の指摘と同趣旨の問題・可読性に大きく影響
- 🔵 Suggestion: より良くなる改善点（任意対応）
````

- [ ] **Step 2: frontmatterを検証する**

以下の条件を目視で確認する：
- `name:` が `code-review` になっている
- `description:` が "Use when..." で始まっている
- `description:` が1024文字以内である

- [ ] **Step 3: コミット**

```bash
git add .agents/skills/code-review/SKILL.md
git commit -m "feat: add code-review skill"
```

---

## Task 4: `update-review-notes` skill の作成

**Files:**
- Create: `.agents/skills/update-review-notes/SKILL.md`

**このskillの役割:** リポジトリの全PRからレビューコメントを取得し、差分のみを `review-notes.md` に追記する。

- [ ] **Step 1: `.agents/skills/update-review-notes/SKILL.md` を作成する**

````markdown
---
name: update-review-notes
description: Use when asked to record, update, or sync GitHub PR review comments into the project's review notes file. Fetches all PRs incrementally and appends new review lessons.
---

# Update Review Notes

## Overview

GitHubの全PRからレビューコメントを取得し、`docs/ai/review-notes.md` に追記する。差分取得方式で動作するため、2回目以降は新しいコメントのみを処理する。

## Prerequisites

- `gh` CLI がインストールされ、GitHubにログインしていること
- `gh auth status` で認証状態を確認できる

## How to Use

### Step 1: 設定を読む

`CLAUDE.md` または `AGENTS.md` 内に `<!-- ai-skills-config -->` ブロックがあれば、review-notesのパスを読み取る。なければデフォルト: `docs/ai/review-notes.md`

### Step 2: リポジトリ情報を取得する

```bash
gh repo view --json owner,name
```

SSH・HTTPS両形式のリモートURLに対応するため、`git remote get-url origin` のパースではなくこのコマンドを使う。

### Step 3: 全PR一覧を取得する

```bash
gh api repos/{owner}/{repo}/pulls?state=all&per_page=100
```

PRが100件を超える場合は `?page=2` などでページネーションして全件取得する。

### Step 4: メタデータを確認して差分取得する

`review-notes.md` 末尾の `<!-- ai-review-notes-metadata ... -->` ブロックを読み、各PRの `last_fetched_at` を確認する。

各PRについて：
- **未処理のPR**（メタデータにない）: 全コメントを取得対象
- **処理済みのPR**（`last_fetched_at` がある）: それ以降に作成されたコメントのみ対象

```bash
# PRレビュー（Approve/Request changes等）
gh api repos/{owner}/{repo}/pulls/{number}/reviews

# インラインコメント
gh api repos/{owner}/{repo}/pulls/{number}/comments
```

取得結果から以下を除外する：
- `user.type === "Bot"` のコメント（自動レビューボット）
- `created_at` が `last_fetched_at` 以前のコメント（処理済み）

### Step 5: 新しい指摘がなければ終了する

全PRを処理した結果、新しいコメントが1件もなければ：

> ✅ 新しいレビュー指摘はありませんでした。

### Step 6: 指摘を分類して追記する

新しいコメントを以下のカテゴリに分類し、`review-notes.md` の本文に追記する：

- 型・型安全性
- コンポーネント設計
- 命名規則
- その他

**重複判定:** 同じカテゴリ内で指摘の意図が同じものは新規エントリを作らず、既存エントリに例として追記する：

```markdown
## 型・型安全性
- 【指摘】Props に型定義がない場合は必ず TypeScript の interface/type を使う
  - 例: PR#1 で `stopFnRef` の型が `any` になっていた
  - 例: PR#3 で `props` が暗黙的に `any` になっていた  ← 追記
```

### Step 7: メタデータを更新する

`review-notes.md` 末尾の `<!-- ai-review-notes-metadata ... -->` ブロックを更新し、処理した全PRの `last_fetched_at` を現在時刻（ISO 8601形式）に更新する：

```
<!-- ai-review-notes-metadata
pr_1:
  last_fetched_at: "2026-03-25T10:00:00Z"
pr_3:
  last_fetched_at: "2026-03-25T10:00:00Z"
-->
```
````

- [ ] **Step 2: frontmatterを検証する**

以下の条件を目視で確認する：
- `name:` が `update-review-notes` になっている
- `description:` が "Use when..." で始まっている
- `description:` が1024文字以内である

- [ ] **Step 3: コミット**

```bash
git add .agents/skills/update-review-notes/SKILL.md
git commit -m "feat: add update-review-notes skill"
```

---

## Task 5: 動作確認

**Files:**
- 変更なし（既存skillsの読み込み確認）

- [ ] **Step 1: `coding` skill の動作を確認する**

以下のプロンプトでClaude Codeに依頼し、skillが自動でinvokeされることを確認する：

```
シンプルなボタンコンポーネントを実装して
```

Expected: skillが `docs/ai/conventions.md` と `docs/ai/review-notes.md` を読んだ上で実装すること

- [ ] **Step 2: `code-review` skill の動作を確認する**

```
コードをレビューして
```

Expected: `git diff main...HEAD` を実行し、規約・指摘を踏まえた構造化レビュー（🔴🟡🔵）が出力されること

- [ ] **Step 3: `update-review-notes` skill の動作を確認する**

```
レビュー指摘を更新して
```

Expected: `gh repo view` → 全PR取得 → レビューコメント取得 → `review-notes.md` に追記されること

- [ ] **Step 4: このプロジェクト用の `conventions.md` を実際の規約で埋める**

`docs/ai/conventions.md` のテンプレートを実際のプロジェクト規約に書き換える。参考として既存コードから規約を推測する場合：

```bash
# 既存コードのスタイルを確認
ls app/
cat app/layout.js
cat app/page.js
```

- [ ] **Step 5: 最終コミット**

```bash
git add docs/ai/conventions.md
git commit -m "docs: fill in project conventions for this project"
```
