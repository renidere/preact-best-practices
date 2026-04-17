---
title: Load Optional or Heavy Modules Conditionally
impact: CRITICAL
impactDescription: keeps first paint focused on what the user can see immediately
tags: bundle, lazy-loading, import
---

## Load Optional or Heavy Modules Conditionally

**Impact: CRITICAL (keeps first paint focused on what the user can see immediately)**

If a module is optional or expensive, load it only when the feature is active rather than during the initial render path.

**Incorrect (loads a heavy feature on first paint even when hidden):**

```typescript
import { RewardsChart } from './RewardsChart'

export function RewardsPanel({ open }: { open: boolean }) {
  return open ? <RewardsChart /> : null
}
```

**Correct (load the heavy module when the feature is needed):**

```typescript
const RewardsChart = lazy(() => import('./RewardsChart'))

export function RewardsPanel({ open }: { open: boolean }) {
  return open ? <RewardsChart /> : null
}
```

Reference: [import() operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
