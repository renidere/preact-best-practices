---
title: Combine Array Passes Only When Clarity Survives
impact: LOW-MEDIUM
impactDescription: removes wasted passes without turning simple code into dense code golf
tags: javascript, arrays, hot-paths
---

## Combine Array Passes Only When Clarity Survives

**Impact: LOW-MEDIUM (removes wasted passes without turning simple code into dense code golf)**

Combining multiple passes can help hot paths, but only if the result stays readable and maintainable.

**Incorrect (multiple passes in a hot path):**

```typescript
const names = users.filter((user) => user.enabled).map((user) => user.name);
```

**Correct (single pass when the intent stays clear):**

```typescript
const names: string[] = [];

for (const user of users) {
  if (user.enabled) names.push(user.name);
}
```

Reference: [Array iteration methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
