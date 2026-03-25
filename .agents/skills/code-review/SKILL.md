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
