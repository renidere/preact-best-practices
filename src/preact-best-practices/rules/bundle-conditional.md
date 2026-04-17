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
import { lazy, Suspense } from 'preact/compat'

const RewardsChart = lazy(() => import('./RewardsChart'))

export function RewardsPanel({ open }: { open: boolean }) {
  return open ? (
    <Suspense fallback={null}>
      <RewardsChart />
    </Suspense>
  ) : null
}
```

> `lazy()` requires a `<Suspense>` boundary somewhere in the ancestor tree. Without it the component will suspend indefinitely with no fallback. Import from `preact/compat` (or `react` if the file is already in a compat-sensitive area).

Reference: [import() operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
