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

**For multiple fields, use `useShallow` to avoid object identity churn:**

```typescript
import { useShallow } from 'zustand/react/shallow'

const { firstName, lastName } = useUserStore(
  useShallow((state) => ({ firstName: state.firstName, lastName: state.lastName }))
)
```

> Returning a new object literal from a selector (`(s) => ({ a: s.a, b: s.b })`) creates a new reference on every store update, causing the component to re-render each time. `useShallow` from `zustand/react/shallow` compares the previous and next results with shallow equality so the component only re-renders when the actual selected values change.

Reference: [Zustand documentation](https://zustand.docs.pmnd.rs/getting-started/introduction)
