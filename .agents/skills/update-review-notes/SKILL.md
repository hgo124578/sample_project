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
