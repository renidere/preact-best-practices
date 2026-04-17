---
title: Avoid Import Churn Between React and Preact
impact: HIGH
impactDescription: reduces compatibility risk and noisy diffs
tags: guardrail, compat, preact, react, imports
---

## Avoid Import Churn Between React and Preact

**Impact: HIGH (reduces compatibility risk and noisy diffs)**

Do not mass-convert `react` imports to `preact` or the reverse just for framework purity. Preserve the import style already used in the local file or compat-sensitive integration area.

**Incorrect (rewrites imports without solving an actual problem):**

```typescript
import { useMemo } from "preact/hooks";
```

**Correct (keep the established import boundary unless there is a concrete need to change it):**

```typescript
import { useMemo } from "react";
```

Reference: [Switching to Preact](https://preactjs.com/guide/v10/switching-to-preact/)
