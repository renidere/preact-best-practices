---
title: Defer Non-critical Third-party Code
impact: CRITICAL
impactDescription: protects initial render from analytics and SDK overhead
tags: bundle, third-party, analytics
---

## Defer Non-critical Third-party Code

**Impact: CRITICAL (protects initial render from analytics and SDK overhead)**

Analytics, logging, and optional SDKs should not compete with initial render or first useful paint.

**Incorrect (loads analytics on the critical path):**

```typescript
import { initAnalytics } from "./analytics";

initAnalytics();
```

**Correct (load third-party code after initial UI work or interaction):**

```typescript
const schedule =
  typeof requestIdleCallback !== "undefined"
    ? requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 1);

schedule(() => {
  import("./analytics").then(({ initAnalytics }) => initAnalytics());
});
```

> `requestIdleCallback` was not available in Safari until 16.4 (March 2023). Older iOS and Safari desktop users may still lack support. Always provide a `setTimeout` fallback.

Reference: [requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
