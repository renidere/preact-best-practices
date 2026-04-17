---
title: Combine Array Passes Only When Clarity Survives
impact: LOW-MEDIUM
impactDescription: removes wasted passes without turning simple code into dense code golf
tags: javascript, arrays, hot-paths
---

## Combine Array Passes Only When Clarity Survives

**Impact: LOW-MEDIUM (removes wasted passes without turning simple code into dense code golf)**

Combining multiple passes can help hot paths, but only if the result stays readable and maintainable. Do not combine passes speculatively — only when profiling shows the loop itself is the bottleneck.

> `flatMap` with conditional `[]` literals creates a temporary array object per element and is often slower than `filter().map()` on most runtimes. It is not a valid reason to combine passes. Use `reduce` when a true single-pass reduction is needed and profiling confirms the gain.

**Incorrect (three separate passes allocate intermediate arrays):**

```typescript
const total = orders
  .filter((o) => o.status === "completed")
  .map((o) => o.amount)
  .reduce((sum, amount) => sum + amount, 0);
```

**Correct (single reduce — one pass, no intermediate arrays):**

```typescript
const total = orders.reduce(
  (sum, o) => (o.status === "completed" ? sum + o.amount : sum),
  0,
);
```

Reference: [Array iteration methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
