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
