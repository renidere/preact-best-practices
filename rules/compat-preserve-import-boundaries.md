---
title: Preserve Compat-sensitive Import Boundaries
impact: HIGH
impactDescription: keeps stable integrations with React ecosystem libraries
tags: compat, preact, react, integration
---

## Preserve Compat-sensitive Import Boundaries

**Impact: HIGH (keeps stable integrations with React ecosystem libraries)**

If a file or subsystem already uses `react` imports because of a compat-sensitive library, preserve that boundary unless there is a real bug or migration plan.

**Incorrect (rewrites a compat-sensitive integration for purity):**

```typescript
import { useMemo } from "preact/hooks";
import { Controller } from "react-hook-form";
```

**Correct (keep the boundary stable inside the compat-heavy area):**

```typescript
import { useMemo } from "react";
import { Controller } from "react-hook-form";
```

Reference: [Differences to React](https://preactjs.com/guide/v10/differences-to-react/)
