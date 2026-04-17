---
title: Run Independent Async Work in Parallel
impact: CRITICAL
impactDescription: reduces full-network-latency waterfalls
tags: async, parallelism, promise-all
---

## Run Independent Async Work in Parallel

**Impact: CRITICAL (reduces full-network-latency waterfalls)**

When operations are independent, start them together and await them together.

**Incorrect (serializes independent work):**

```typescript
const user = await fetchUser();
const config = await fetchConfig();

return { user, config };
```

**Correct (runs independent work in parallel):**

```typescript
const [user, config] = await Promise.all([fetchUser(), fetchConfig()]);

return { user, config };
```

Reference: [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
