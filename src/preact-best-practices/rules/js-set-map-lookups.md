---
title: Use Set or Map for Repeated Lookups
impact: LOW-MEDIUM
impactDescription: avoids repeated linear scans on meaningful collections
tags: javascript, map, set, lookups
---

## Use Set or Map for Repeated Lookups

**Impact: LOW-MEDIUM (avoids repeated linear scans on meaningful collections)**

When repeated membership checks or keyed lookups happen on non-trivial collections, `Set` and `Map` are usually a better fit than repeated `includes()` or `find()` calls.

**Incorrect (repeated linear scan inside a loop — O(n²) total):**

```typescript
for (const id of selectedIds) {
  if (allowedIds.includes(id)) {
    process(id);
  }
}
```

**Correct (build the Set once, O(1) per lookup):**

```typescript
const allowedIdSet = new Set(allowedIds);

for (const id of selectedIds) {
  if (allowedIdSet.has(id)) {
    process(id);
  }
}
```

Reference: [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
