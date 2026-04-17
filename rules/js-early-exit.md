---
title: Prefer Early Returns and Simpler Control Flow
impact: LOW-MEDIUM
impactDescription: reduces unnecessary work and keeps hot code easier to reason about
tags: javascript, control-flow
---

## Prefer Early Returns and Simpler Control Flow

**Impact: LOW-MEDIUM (reduces unnecessary work and keeps hot code easier to reason about)**

Prefer early returns when they remove unnecessary nesting or avoid work on common negative paths.

**Incorrect (deep nesting for a common exit path):**

```typescript
function getPrizeLabel(prize?: Prize) {
  if (prize) {
    return prize.label;
  }

  return "Unknown";
}
```

**Correct (clear early return):**

```typescript
function getPrizeLabel(prize?: Prize) {
  if (!prize) return "Unknown";
  return prize.label;
}
```

Reference: [Control flow and code clarity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
