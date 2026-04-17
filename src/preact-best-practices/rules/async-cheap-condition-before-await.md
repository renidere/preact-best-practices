---
title: Check Cheap Conditions Before Await
impact: CRITICAL
impactDescription: avoids unnecessary async work on cold paths
tags: async, control-flow, waterfall
---

## Check Cheap Conditions Before Await

**Impact: CRITICAL (avoids unnecessary async work on cold paths)**

If a cheap synchronous condition can fail early, evaluate it before awaiting a remote flag or network value.

**Incorrect (waits even when the local guard already fails):**

```typescript
const featureEnabled = await fetchFeatureFlag();

if (featureEnabled && isVisible) {
  openPanel();
}
```

**Correct (skip remote work when the cheap guard is false):**

```typescript
if (isVisible) {
  const featureEnabled = await fetchFeatureFlag();

  if (featureEnabled) {
    openPanel();
  }
}
```

Reference: [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
