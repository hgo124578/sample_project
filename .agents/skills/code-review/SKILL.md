---
name: code-review
description: Use when asked to review code, check a pull request, or review changes before merging. Reviews git diff against project conventions and past PR review lessons.
---

# Code Review

## Overview

When asked to review code, produce structured review output based on:

1. Committed diff between current branch and base branch
2. Project conventions (`docs/ai/conventions.md`)
3. Past PR review lessons (`docs/ai/review-notes.md`)
4. General best practices

## How to Use

### Step 1: Read config

Check `CLAUDE.md` or `AGENTS.md` for an `<!-- ai-skills-config -->` block:

```
<!-- ai-skills-config -->
conventions: docs/project-rules.md
review-notes: docs/review-history.md
base-branch: develop
<!-- /ai-skills-config -->
```

If no block is found, use defaults:
- conventions: `docs/ai/conventions.md`
- review-notes: `docs/ai/review-notes.md`
- base-branch: auto-detect → `main`

### Step 2: Identify base branch

1. Use `base-branch` from config if present
2. Otherwise auto-detect: `git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null`
3. Fall back to `main` if detection fails

### Step 3: Get diff

```bash
git diff <base-branch>...HEAD
```

If the diff exceeds 500 lines, show stats first and ask whether to review file-by-file or all at once:

```bash
git diff --stat <base-branch>...HEAD
```

> Large diff (XXX lines). Review file-by-file or all at once?

### Step 4: Read conventions and review notes

- Read `conventions.md` (warn and continue if missing)
- Read `review-notes.md` (continue silently if missing)

### Step 5: Output review results

Use this format:

```
## Code Review

### 🔴 Critical (must fix before merge)
- [filename:line] issue

### 🟡 Important (strongly recommended)
- [filename:line] issue

### 🔵 Suggestion (optional improvement)
- [filename:line] issue

### ✅ No issues
(if nothing to report)
```

**Severity criteria:**
- 🔴 Critical: bugs, security issues, broken builds, major convention violations
- 🟡 Important: convention violations, same issue as a past review note, significant readability problems
- 🔵 Suggestion: improvements that would make the code better (optional)
