---
title: Derive Cheap State During Render
impact: MEDIUM-HIGH
impactDescription: avoids extra render-effect-setState cycles
tags: rerender, derived-state, effects
---

## Derive Cheap State During Render

**Impact: MEDIUM-HIGH (avoids extra render-effect-setState cycles)**

If a value can be computed cheaply and synchronously from current props or state, derive it during render instead of mirroring it with an effect.

**Incorrect (mirrors derived state through an effect):**

```typescript
const [hasResults, setHasResults] = useState(false);

useEffect(() => {
  setHasResults(items.length > 0);
}, [items]);
```

**Correct (derive directly in render):**

```typescript
const hasResults = items.length > 0;
```

Reference: [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
