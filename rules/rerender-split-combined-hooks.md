---
title: Split Combined Hook Computations
impact: MEDIUM
impactDescription: avoids rerunning independent work when only one dependency changes
tags: rerender, hooks, memo, effects, dependencies
---

## Split Combined Hook Computations

**Impact: MEDIUM (avoids rerunning independent work when only one dependency changes)**

When one `useMemo` or `useEffect` mixes independent steps with different dependencies, split them so each step reruns only when its own inputs change.

**Incorrect (changing sort order recomputes filtering too):**

```typescript
const sortedProducts = useMemo(() => {
  const filtered = products.filter((p) => p.category === category);
  const sorted = filtered.toSorted((a, b) =>
    sortOrder === "asc" ? a.price - b.price : b.price - a.price,
  );
  return sorted;
}, [products, category, sortOrder]);
```

**Correct (split independent computations by dependency shape):**

```typescript
const filteredProducts = useMemo(
  () => products.filter((p) => p.category === category),
  [products, category],
);

const sortedProducts = useMemo(
  () =>
    filteredProducts.toSorted((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price,
    ),
  [filteredProducts, sortOrder],
);
```

**The same rule applies to unrelated side effects:**

```typescript
useEffect(() => {
  analytics.trackPageView(pathname);
  document.title = `${pageTitle} | My App`;
}, [pathname, pageTitle]);

useEffect(() => {
  analytics.trackPageView(pathname);
}, [pathname]);

useEffect(() => {
  document.title = `${pageTitle} | My App`;
}, [pageTitle]);
```

Reference: [useMemo](https://react.dev/reference/react/useMemo)
