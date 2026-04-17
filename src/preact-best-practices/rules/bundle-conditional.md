---
title: Load Optional Expensive Modules Conditionally
impact: CRITICAL
impactDescription: keeps first paint focused on what the user can see immediately
tags: bundle, lazy-loading, import
---

## Load Optional Expensive Modules Conditionally

**Impact: CRITICAL (keeps first paint focused on what the user can see immediately)**

Split a module into a separate chunk when it is **both optional and expensive**. Lazy-loading a cheap module is counterproductive: the user pays a network delay (~200 ms) on the first interaction for no meaningful bundle-size savings. A module that is expensive but always needed should simply be in the main bundle.

**Incorrect (loads an expensive feature on first paint even when hidden):**

```typescript
import { RewardsChart } from './RewardsChart'

export function RewardsPanel({ open }: { open: boolean }) {
  return open ? <RewardsChart /> : null
}
```

**Also incorrect (lazy-loads a cheap module — adds ~200 ms click delay for no real savings):**

```typescript
import { lazy, Suspense } from 'preact/compat'
import { useState } from 'preact/hooks'

const Badge = lazy(() => import('./Badge'))

export function StatusToggle() {
  const [on, setOn] = useState(false)
  return (
    <button onClick={() => setOn(v => !v)}>
      {on && (
        <Suspense fallback={null}>
          <Badge />
        </Suspense>
      )}
    </button>
  )
}
```

> If `<Badge />` is only a few kilobytes, ship it eagerly. The user should not wait for a network round-trip after clicking a button just to show a tiny icon.

**Correct (lazy-load only when the module is both optional and expensive):**

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
>
> The only case where lazy-loading a cheap module is justified is when the condition is **static** (resolved at build time or never changes at runtime), but this is rare in practice.

Reference: [import() operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
