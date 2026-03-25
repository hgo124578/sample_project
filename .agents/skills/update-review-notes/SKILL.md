---
name: update-review-notes
description: Use when asked to record, update, or sync GitHub PR review comments into the project's review notes file. Fetches all PRs incrementally and appends new review lessons.
---

# Update Review Notes

## Overview

Fetch review comments from all GitHub PRs and append new lessons to `docs/ai/review-notes.md`. Uses incremental fetching — on subsequent runs, only new comments since the last fetch are processed.

## Prerequisites

- `gh` CLI installed and authenticated (`gh auth status` to verify)

## How to Use

### Step 1: Read config

Check `CLAUDE.md` or `AGENTS.md` for an `<!-- ai-skills-config -->` block and read the `review-notes` path. Default: `docs/ai/review-notes.md`

```
<!-- ai-skills-config -->
review-notes: docs/review-history.md
<!-- /ai-skills-config -->
```

### Step 2: Get repository info

```bash
gh repo view --json owner,name
```

Use this command (not `git remote get-url origin`) to handle both HTTPS and SSH remote URL formats.

### Step 3: Fetch all PRs

```bash
gh api repos/{owner}/{repo}/pulls?state=all&per_page=100
```

If the repo has more than 100 PRs, paginate using `?page=2`, etc., until all PRs are retrieved.

### Step 4: Incremental fetch per PR

Read the `<!-- ai-review-notes-metadata ... -->` block at the end of `review-notes.md` and check `last_fetched_at` for each PR.

- **New PR** (not in metadata): fetch all comments
- **Previously fetched PR** (has `last_fetched_at`): fetch only comments created after that timestamp

```bash
# Review-level comments (Approve / Request changes / etc.)
gh api repos/{owner}/{repo}/pulls/{number}/reviews

# Inline comments
gh api repos/{owner}/{repo}/pulls/{number}/comments
```

Exclude from results:
- Comments where `user.type === "Bot"` (automated review bots)
- Comments where `created_at` is on or before `last_fetched_at` (already processed)

### Step 5: Exit early if nothing new

If no new comments were found across all PRs:

> ✅ No new review notes found.

### Step 6: Classify and append

Classify new comments into categories and append to the body of `review-notes.md`:

- Type safety
- Component design
- Naming conventions
- Other

**Deduplication rule:** If a new comment has the same intent as an existing entry in the same category, do not create a new entry — add it as an example under the existing one:

```markdown
## Type safety
- [Note] Always use TypeScript interface/type for props — never implicit `any`
  - Example: PR#1 — `stopFnRef` was typed as `any`, fixed to `MutableRefObject<(() => void) | null>`
  - Example: PR#3 — `props` had implicit `any`  ← appended
```

### Step 7: Update metadata

Update the `<!-- ai-review-notes-metadata ... -->` block at the end of `review-notes.md` with the current timestamp (ISO 8601) for all processed PRs:

```
<!-- ai-review-notes-metadata
pr_1:
  last_fetched_at: "2026-03-25T10:00:00Z"
pr_3:
  last_fetched_at: "2026-03-25T10:00:00Z"
-->
```
