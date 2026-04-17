---
title: Narrow Effect Dependencies
impact: MEDIUM
impactDescription: minimizes effect reruns and reduces hidden dependency churn
tags: rerender, effects, dependencies
---

## Narrow Effect Dependencies

**Impact: MEDIUM (minimizes effect reruns and reduces hidden dependency churn)**

Effects should depend on the narrow primitive values they actually use, not broad objects or wider state containers.

**Incorrect (reruns on unrelated object field changes):**

```typescript
useEffect(() => {
  syncUser(user.id);
}, [user]);
```

**Correct (depend on the specific primitive actually used):**

```typescript
useEffect(() => {
  syncUser(user.id);
}, [user.id]);
```

**For derived booleans, depend on the boolean instead of the raw source:**

```typescript
useEffect(() => {
  if (width < 768) {
    enableMobileMode();
  }
}, [width]);

const isMobile = width < 768;

useEffect(() => {
  if (isMobile) {
    enableMobileMode();
  }
}, [isMobile]);
```

Reference: [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
