---
title: Prefer Early Returns and Simpler Control Flow
impact: LOW-MEDIUM
impactDescription: reduces unnecessary work and keeps hot code easier to reason about
tags: javascript, control-flow
---

## Prefer Early Returns and Simpler Control Flow

**Impact: LOW-MEDIUM (reduces unnecessary work and keeps hot code easier to reason about)**

Prefer early returns when they remove unnecessary nesting or avoid work on common negative paths.

**Incorrect (positive nesting buries the main work under multiple conditions):**

```typescript
function getShippingCost(order?: Order) {
  if (order) {
    if (order.items.length > 0) {
      return order.items.length * 4.99;
    }
    return 0;
  }
  return null;
}
```

**Correct (guard clauses exit early, main logic stays unindented):**

```typescript
function getShippingCost(order?: Order) {
  if (!order) return null;
  if (order.items.length === 0) return 0;
  return order.items.length * 4.99;
}
```

Reference: [Control flow and code clarity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
