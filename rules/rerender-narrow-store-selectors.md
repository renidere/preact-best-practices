---
title: Narrow Store Selectors
impact: MEDIUM-HIGH
impactDescription: reduces rerenders from broad shared-state subscriptions
tags: rerender, zustand, selectors, state
---

## Narrow Store Selectors

**Impact: MEDIUM-HIGH (reduces rerenders from broad shared-state subscriptions)**

Subscribe to the smallest useful store slice or derived boolean rather than a large object.

**Incorrect (subscribes to a broad store object):**

```typescript
const prizeState = usePrizeStore((state) => state);
```

**Correct (subscribe only to what the component renders):**

```typescript
const hasPendingPrize = usePrizeStore((state) => state.pending.length > 0);
```

Reference: [Zustand documentation](https://zustand.docs.pmnd.rs/)
