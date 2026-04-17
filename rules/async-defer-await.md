---
title: Defer Await Until Needed
impact: CRITICAL
impactDescription: prevents blocking branches that never use the awaited value
tags: async, control-flow, waterfall
---

## Defer Await Until Needed

**Impact: CRITICAL (prevents blocking branches that never use the awaited value)**

Move `await` into the branch that actually needs the result instead of blocking every path up front.

**Incorrect (blocks both branches):**

```typescript
const profile = await loadProfile(userId);

if (skipProfile) {
  return null;
}

return profile;
```

**Correct (await only in the branch that uses the value):**

```typescript
if (skipProfile) {
  return null;
}

return await loadProfile(userId);
```

Reference: [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
