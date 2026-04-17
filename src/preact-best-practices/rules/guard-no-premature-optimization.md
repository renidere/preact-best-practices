---
title: Do Not Optimize Without Evidence
impact: HIGH
impactDescription: prevents wasted effort and code complexity from speculative changes
tags: guard, optimization, profiling, measurement
---

## Do Not Optimize Without Evidence

**Impact: HIGH (prevents wasted effort and code complexity from speculative changes)**

Structural rules (guardrails, async, bundle, compat, client data) apply regardless of runtime performance because they improve correctness, compatibility, and data hygiene. Re-render, rendering, and JavaScript hot-path rules require an observable symptom, profiler finding, or clear anti-pattern before applying.

**Incorrect (applies optimization speculatively):**

```typescript
// Wrapping in useCallback "just in case" without evidence of a real cost
const handleClick = useCallback(() => {
  setActive(id);
}, [id]);
```

**Correct (addresses an observed symptom):**

```typescript
// DevTools profiler shows this child re-renders on every parent update
// and its render takes >16ms on the target device.
// Narrowing the store selector cuts the re-render rate.
const isActive = useStore((s) => s.activeId === id);
```

Structural changes that are always safe to recommend:
- replacing effect-mirrored derived state with inline computation
- running independent async work in parallel
- removing unused barrel imports from bundle-sensitive paths

Changes that require an observable symptom or profiler evidence:
- narrowing store selectors on components that already render fast
- adding `content-visibility` to sections without scroll performance issues
- converting `Array.includes` to `Set.has` on small collections

Reference: [React Performance Optimization](https://react.dev/learn/render-and-commit)
