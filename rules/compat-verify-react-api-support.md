---
title: Verify React-oriented API Support Before Recommending It
impact: HIGH
impactDescription: prevents advice that compiles conceptually but fails in the current stack
tags: compat, react, preact, api
---

## Verify React-oriented API Support Before Recommending It

**Impact: HIGH (prevents advice that compiles conceptually but fails in the current stack)**

Do not recommend a React-oriented API in company Preact code unless the current setup supports it.

**Incorrect (recommends a React-only API without checking support):**

```typescript
const onSearch = useEffectEvent((value: string) => {
  sendSearchMetric(value);
});
```

**Correct (use a framework-safe pattern unless support is confirmed):**

```typescript
const latestValueRef = useRef("");

const onSearch = (value: string) => {
  latestValueRef.current = value;
  sendSearchMetric(value);
};
```

Reference: [Switching to Preact](https://preactjs.com/guide/v10/switching-to-preact/)
