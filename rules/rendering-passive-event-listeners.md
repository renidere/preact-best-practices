---
title: Use Passive Event Listeners When Safe
impact: MEDIUM
impactDescription: keeps scroll and touch paths from blocking the browser
tags: rendering, browser, events, passive
---

## Use Passive Event Listeners When Safe

**Impact: MEDIUM (keeps scroll and touch paths from blocking the browser)**

For scroll and touch listeners that do not call `preventDefault()`, use passive listeners so the browser can continue scrolling smoothly.

**Incorrect (creates a potentially blocking scroll listener):**

```typescript
window.addEventListener("scroll", onScroll);
```

**Correct (mark the listener as passive when safe):**

```typescript
window.addEventListener("scroll", onScroll, { passive: true });
```

Reference: [addEventListener options](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
