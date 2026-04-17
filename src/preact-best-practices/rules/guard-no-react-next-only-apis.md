---
title: Exclude React-only and Next.js-only APIs by Default
impact: HIGH
impactDescription: prevents incompatible recommendations from generic React guidance
tags: guardrail, react, nextjs, compat
---

## Exclude React-only and Next.js-only APIs by Default

**Impact: HIGH (prevents incompatible recommendations from generic React guidance)**

Do not recommend APIs such as `React.cache()`, `next/dynamic`, server actions, or `after()` in company Preact apps unless the stack explicitly supports them.

**Incorrect (imports a framework-specific API into a Vite-based Preact app):**

```typescript
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"));
```

**Correct (use framework-safe browser-side loading):**

```typescript
import { lazy, Suspense } from 'preact/compat'

const HeavyChart = lazy(() => import("./HeavyChart"))

function Dashboard() {
  return (
    <Suspense fallback={null}>
      <HeavyChart />
    </Suspense>
  )
}
```

> `lazy()` requires a `<Suspense>` boundary in the ancestor tree. Import from `preact/compat` (or `react` if the file is already in a compat-sensitive area).

Reference: [Differences to React](https://preactjs.com/guide/v10/differences-to-react/)
