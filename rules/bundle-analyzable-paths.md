---
title: Prefer Statically Analyzable Paths
impact: HIGH
impactDescription: keeps bundles and traces narrow and predictable
tags: bundle, vite, import, dynamic-import, paths
---

## Prefer Statically Analyzable Paths

**Impact: HIGH (keeps bundles and traces narrow and predictable)**

Build tools work best when import and file-system paths are obvious at build time. If the real path is hidden inside a variable or composed too dynamically, the tool either has to include a broader set of possible files or warn that it cannot analyze the import safely.

Prefer explicit maps or literal paths so the set of reachable files stays narrow and predictable.

**Incorrect (the bundler cannot narrow the import set well):**

```typescript
const PAGE_MODULES = {
  home: "./pages/home",
  settings: "./pages/settings",
} as const;

const Page = await import(PAGE_MODULES[pageName]);
```

**Correct (keep each final path explicit):**

```typescript
const PAGE_MODULES = {
  home: () => import("./pages/home"),
  settings: () => import("./pages/settings"),
} as const;

const Page = await PAGE_MODULES[pageName]();
```

Reference: [Vite features](https://vite.dev/guide/features.html)
