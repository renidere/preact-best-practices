---
title: Prefer Direct Imports in Bundle-sensitive Paths
impact: CRITICAL
impactDescription: avoids pulling broad dependency surfaces into entry bundles
tags: bundle, imports, vite
---

## Prefer Direct Imports in Bundle-sensitive Paths

**Impact: CRITICAL (avoids pulling broad dependency surfaces into entry bundles)**

In entry paths or heavy screens, prefer direct imports over broad barrel files when that keeps the bundle smaller and more analyzable.

**Incorrect (uses a broad barrel from a sensitive path):**

```typescript
import { Dialog, Button, Tabs } from "@/components";
```

**Correct (import only the modules actually used):**

```typescript
import { Dialog } from "@/components/Dialog";
import { Button } from "@/components/Button";
import { Tabs } from "@/components/Tabs";
```

Reference: [Vite guide](https://vite.dev/guide/)
