---
title: Use Async or Deferred Script Loading
impact: MEDIUM
impactDescription: prevents external scripts from blocking parsing and initial paint
tags: rendering, scripts, loading
---

## Use Async or Deferred Script Loading

**Impact: MEDIUM (prevents external scripts from blocking parsing and initial paint)**

If an external script is not required during initial parsing, load it with `defer` or `async`.

**Incorrect (parser-blocking script):**

```html
<script src="https://example.com/analytics.js"></script>
```

**Correct (non-blocking script load):**

```html
<script defer src="https://example.com/analytics.js"></script>
```

Reference: [script element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script)
