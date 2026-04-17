---
title: Do Not Recommend HTM by Default
impact: HIGH
impactDescription: avoids tooling churn and TSX regressions in Vite-based apps
tags: guardrail, preact, vite, tsx
---

## Do Not Recommend HTM by Default

**Impact: HIGH (avoids tooling churn and TSX regressions in Vite-based apps)**

Company Preact apps use `TSX` with Vite and TypeScript. Recommending `HTM` by default changes the authoring model, typing ergonomics, and review surface without helping most maintenance work.

**Incorrect (rewrites to a different authoring model without a concrete need):**

```typescript
import { html } from "htm/preact";

export function ProfileCard({ name }: { name: string }) {
  return html`<div class="card">${name}</div>`;
}
```

**Correct (keeps the project's default TSX style):**

```typescript
type ProfileCardProps = { name: string }

export function ProfileCard({ name }: ProfileCardProps) {
  return <div className="card">{name}</div>
}
```

> Preact supports both `class` and `className`. However, if the project uses `paths` aliases (`react → preact/compat`) in `tsconfig.json`, TypeScript may resolve React's type definitions and require `className` instead. Use whichever the local file already uses consistently.

Reference: [Preact getting started](https://preactjs.com/guide/v10/getting-started/)
