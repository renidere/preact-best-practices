---
title: Use Set or Map for Repeated Lookups
impact: LOW-MEDIUM
impactDescription: avoids repeated linear scans on meaningful collections
tags: javascript, map, set, lookups
---

## Use Set or Map for Repeated Lookups

**Impact: LOW-MEDIUM (avoids repeated linear scans on meaningful collections)**

When repeated membership checks or keyed lookups happen on non-trivial collections, `Set` and `Map` are usually a better fit than repeated `includes()` or `find()` calls.

**Incorrect (repeated linear scans):**

```typescript
const isAllowed = allowedIds.includes(userId);
```

**Correct (constant-time lookup after setup):**

```typescript
const allowedIdSet = new Set(allowedIds);
const isAllowed = allowedIdSet.has(userId);
```

Reference: [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
