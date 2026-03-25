---
name: coding
description: Use when asked to write, implement, or modify code. Ensures implementation follows project conventions, general best practices, and lessons learned from past PR reviews.
---

# Coding

## Overview

When asked to implement code, use these three inputs to guide the implementation:

1. General best practices
2. Project conventions (`docs/ai/conventions.md`)
3. Past PR review lessons (`docs/ai/review-notes.md`)

## How to Use

### Step 1: Read config

Check `CLAUDE.md` or `AGENTS.md` for an `<!-- ai-skills-config -->` block and read path overrides from it:

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

### Step 2: Read conventions file

Read the file at the resolved path.

If the file does not exist:
> ⚠️ Conventions file not found (`docs/ai/conventions.md`). Create it or specify a path in CLAUDE.md. Proceeding with best practices only.

### Step 3: Read review notes file

Read the file at the resolved path. If the file does not exist, continue silently with no past review notes.

### Step 4: Declare relevant past review notes

If the content of `review-notes.md` is relevant to the current task (e.g., writing a similar component, using the same library), explicitly state this before implementing:

> 📌 Past review notes apply to this task. Addressing the following:
> - [relevant note]

### Step 5: Implement

Write the code with all of the following in mind: project conventions, general best practices, and past review lessons.
